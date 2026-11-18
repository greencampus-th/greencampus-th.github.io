// Tiny Supabase client for the Activity Center pages (no SDK).
// Uses the public publishable key from supabase-config.js; row level security protects the data.
(function () {
  const cfg = window.GC_SUPABASE || {};
  const KEY = 'gc.session';
  let session = null;
  try { session = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { session = null; }

  const save = (s) => { session = s; try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch {} };
  const headers = (auth = true, extra = {}) => ({
    apikey: cfg.key,
    ...(auth && session ? { Authorization: 'Bearer ' + session.access_token } : (cfg.key.startsWith('eyJ') ? { Authorization: 'Bearer ' + cfg.key } : {})),
    ...extra,
  });
  const take = (d) => save({ access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Date.now() / 1000 + (d.expires_in || 3600), user_id: d.user && d.user.id });

  async function refresh() {
    if (!session) return false;
    const r = await fetch(cfg.url + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: headers(false, { 'Content-Type': 'application/json' }), body: JSON.stringify({ refresh_token: session.refresh_token }) });
    if (!r.ok) { save(null); return false; }
    take(await r.json());
    return true;
  }

  async function call(path, opts = {}) {
    if (session && Date.now() / 1000 > session.expires_at - 60) await refresh();
    const run = () => fetch(cfg.url + path, { ...opts, headers: headers(true, opts.headers || {}) });
    let r = await run();
    if (r.status === 401 && session && (await refresh())) r = await run();
    const text = await r.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    return { ok: r.ok, status: r.status, data };
  }

  const errText = (d, fallback) => {
    const m = (d && (d.msg || d.error_description || d.message || d.error)) || '';
    if (/too_many_attempts/.test(m)) return 'ใส่รหัสผิดหลายครั้งเกินไป กรุณารอ 15 นาที';
    if (/Email not confirmed/.test(m)) return 'ยังไม่ได้ยืนยันอีเมล กรุณากดลิงก์ในอีเมลก่อน';
    return typeof m === 'string' && m && !/^[a-z_]+$/.test(m) ? m : fallback;
  };

  window.SB = {
    url: cfg.url,
    get session() { return session; },
    call,
    errText,
    async signIn(identifier, password) {
      let email = identifier.trim();
      if (!email.includes('@')) {
        const r = await call('/rest/v1/rpc/login_email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: email, password }) });
        if (!r.ok) return { ok: false, error: errText(r.data, 'เข้าสู่ระบบไม่สำเร็จ') };
        if (!r.data) return { ok: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
        email = r.data;
      }
      const t = await fetch(cfg.url + '/auth/v1/token?grant_type=password', { method: 'POST', headers: headers(false, { 'Content-Type': 'application/json' }), body: JSON.stringify({ email: email.toLowerCase(), password }) });
      const d = await t.json().catch(() => ({}));
      if (!t.ok) return { ok: false, error: errText(d, 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง') };
      take(d);
      return { ok: true };
    },
    signOut() { save(null); },
    async profile() {
      if (!session) return null;
      const r = await call('/rest/v1/profiles?select=username,display_name,role,student_id&id=eq.' + session.user_id);
      return r.ok && r.data && r.data[0] ? r.data[0] : null;
    },
    rpc(name, args = {}) {
      return call('/rest/v1/rpc/' + name, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
    },
  };
})();
