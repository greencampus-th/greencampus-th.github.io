# เว็บดาวน์โหลดเกม Green Campus

เว็บหน้าเดียวสำหรับแจกไฟล์ติดตั้งเกม แยกจากโปรเจกต์เกม (`green-campus`)
- **ตัวเว็บ:** ฝากที่ **GitHub Pages** (ฟรี ออนไลน์ตลอด ลิงก์ถาวร)
- **ไฟล์ติดตั้ง:** เก็บที่ **GitHub Releases** (ฟรี รับไฟล์ได้ถึง 2 GB)
- **ปุ่มดาวน์โหลด:** ชี้ไปเวอร์ชันล่าสุดเสมอ ออกเวอร์ชันใหม่ไม่ต้องแก้เว็บ

## ดูตัวอย่างในเครื่อง
```
node serve.mjs
```
แล้วเปิด http://localhost:3200

## ขึ้นออนไลน์ครั้งแรก (ทำครั้งเดียว)
1. สมัคร https://github.com (ถ้ายังไม่มีบัญชี)
2. ติดตั้ง GitHub CLI: `winget install --id GitHub.cli` แล้วปิดและเปิด PowerShell ใหม่
3. ล็อกอิน: `gh auth login` → GitHub.com → HTTPS → Login with a web browser แล้วทำตามที่หน้าจอบอก
4. ในโฟลเดอร์นี้รัน: `.\scripts\setup-github.ps1`
   - สร้าง repo `green-campus-download` แบบสาธารณะ อัปโหลดเว็บ และเปิด GitHub Pages
   - แก้ `config.js` ให้ปุ่มดาวน์โหลดชี้ไปที่ repo ของคุณ
   - ได้ลิงก์เว็บแบบ `https://<ชื่อผู้ใช้>.github.io/green-campus-download/` (ครั้งแรกรอ 1–2 นาที)
5. อัปโหลดไฟล์ติดตั้ง: `.\scripts\publish-release.ps1 1.0.0`

## ออกเวอร์ชันใหม่
1. ในโปรเจกต์เกม แก้เลขเวอร์ชันใน `installer\GreenCampus.iss` แล้วรัน `build-windows.bat`
2. ในโฟลเดอร์นี้: `.\scripts\publish-release.ps1 1.0.1 "สิ่งที่เปลี่ยน เช่น เพิ่มตั้งค่ากราฟิก"`
3. เว็บจะแสดงเวอร์ชันใหม่ ขนาดไฟล์ และรายการ "มีอะไรใหม่" เอง

## แก้เนื้อหาเว็บ
- **ข้อความ:** `index.html`
- **สี / รูปแบบ:** `style.css`
- **ภาพตัวอย่าง:** `assets/screens/` (ถ่ายจากเกมด้วยตัวเลือก `--shot` ของ Godot)
- **ลิงก์เล่นบนเว็บ:** ใส่ `webPlayUrl` ใน `config.js` (ใช้ได้เมื่อมีที่อยู่ถาวร ลิงก์ trycloudflare เปลี่ยนบ่อย ไม่ควรใส่)
- แก้แล้วอัปขึ้นเว็บ: `git add -A`, `git commit -m "แก้เว็บ"`, `git push`

## เงื่อนไขตัวละคร
ตัวละครผู้เล่นออกแบบโดยทีมพัฒนา Green Campus (Oykwan) ใช้ได้เฉพาะในเกม Green Campus ห้ามแยกไฟล์ตัวละครไปแจก
