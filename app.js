// Download button, version info and change list come from GitHub Releases,
// so publishing a new release updates the site without editing it.
(function () {
  const cfg = window.GC_SITE || {};
  const $ = (s) => document.querySelector(s);
  const configured = cfg.repo && !cfg.repo.startsWith('OWNER/');
  const dl = $('#dl');
  const meta = $('#dlMeta');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mb = (n) => (n / 1048576).toFixed(0) + ' MB';
  const thDate = (iso) => new Date(iso).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  if (cfg.webPlayUrl) { const p = $('#play'); p.href = cfg.webPlayUrl; p.hidden = false; }

  // phones, tablets and Macs can't run the installer: say so under the button
  if (!/Windows/i.test(navigator.userAgent)) {
    const n = document.createElement('p');
    n.className = 'note';
    n.textContent = '📱 ไฟล์ติดตั้งนี้สำหรับคอมพิวเตอร์ Windows · ส่งลิงก์หน้านี้ไปเปิดบนคอมเพื่อดาวน์โหลด' + (cfg.webPlayUrl ? ' หรือกด "เล่นบนเว็บ"' : '');
    $('.cta').after(n);
  }

  if (!configured) {
    dl.setAttribute('aria-disabled', 'true');
    dl.removeAttribute('href');
    meta.textContent = 'ยังไม่ได้ตั้งค่าที่เก็บไฟล์ (แก้ repo ใน config.js)';
    $('#releases').innerHTML = '<p class="muted">รายการเวอร์ชันจะแสดงเมื่อเชื่อม GitHub Releases แล้ว</p>';
  } else {
    // stable link: always the installer of the newest release
    dl.href = `https://github.com/${cfg.repo}/releases/latest/download/${encodeURIComponent(cfg.asset)}`;
    meta.textContent = 'เวอร์ชันล่าสุด';
    fetch(`https://api.github.com/repos/${cfg.repo}/releases?per_page=6`, { headers: { Accept: 'application/vnd.github+json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((list) => {
        const rels = list.filter((r) => !r.draft && !r.prerelease);
        if (!rels.length) { meta.textContent = 'ยังไม่มีเวอร์ชันที่เผยแพร่'; $('#releases').innerHTML = '<p class="muted">ยังไม่มีเวอร์ชันที่เผยแพร่</p>'; return; }
        const latest = rels[0];
        const asset = (latest.assets || []).find((a) => a.name === cfg.asset);
        meta.textContent = [latest.tag_name, asset ? mb(asset.size) : null, thDate(latest.published_at)].filter(Boolean).join(' · ');
        $('#releases').innerHTML = rels.map((r) => `<article><h3>${esc(r.name || r.tag_name)}</h3>
          <div class="meta">${esc(thDate(r.published_at))}</div>
          ${r.body ? `<div class="body">${esc(r.body.trim())}</div>` : ''}</article>`).join('');
      })
      .catch(() => { meta.textContent = 'เวอร์ชันล่าสุด'; $('#releases').innerHTML = '<p class="muted">ดูรายการเวอร์ชันได้ที่หน้า GitHub Releases</p>'; });
  }

  // screenshot lightbox
  const lb = $('#lb');
  const close = () => { lb.hidden = true; };
  document.querySelectorAll('#gal figure').forEach((f) => f.addEventListener('click', () => {
    const img = f.querySelector('img');
    lb.querySelector('img').src = img.src;
    lb.querySelector('img').alt = img.alt;
    lb.querySelector('p').textContent = f.querySelector('figcaption').textContent;
    lb.hidden = false;
  }));
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.tagName === 'BUTTON') close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();
