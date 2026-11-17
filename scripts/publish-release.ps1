# Publishes a new game version: uploads the installer to GitHub Releases.
# The site's download button always points at the newest release, so the site needs no edit.
# Usage (PowerShell, in this folder):
#   .\scripts\publish-release.ps1 1.0.1 "แก้บัคแผนที่ · เพิ่มตั้งค่ากราฟิก"
param(
  [Parameter(Mandatory = $true)][string]$Version,
  [string]$Notes = ''
)
# git/gh print progress and warnings on stderr; Windows PowerShell would treat that as an error,
# so check exit codes instead of stopping on stderr
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$site = Split-Path -Parent $PSScriptRoot
$cfg = Get-Content (Join-Path $site 'config.js') -Raw -Encoding UTF8
$repo = [regex]::Match($cfg, "repo: '([^']+)'").Groups[1].Value
$asset = [regex]::Match($cfg, "asset: '([^']+)'").Groups[1].Value
if (-not $repo -or $repo.StartsWith('OWNER/')) { Write-Host 'ยังไม่ได้ตั้งค่า repo: รัน .\scripts\setup-github.ps1 ก่อน' -ForegroundColor Yellow; exit 1 }

# installer built by green-campus\build-windows.bat
$dist = Join-Path (Split-Path -Parent $site) 'green-campus\dist'
$setup = Join-Path $dist "GreenCampus-Setup-$Version.exe"
if (-not (Test-Path $setup)) {
  $setup = Get-ChildItem $dist -Filter 'GreenCampus-Setup-*.exe' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
}
if (-not $setup) { Write-Host "ไม่พบไฟล์ติดตั้งใน $dist  (รัน build-windows.bat ก่อน)" -ForegroundColor Yellow; exit 1 }

# every release carries the installer under the same name, so /releases/latest/download/<asset> always works
$tmp = Join-Path ([IO.Path]::GetTempPath()) ("gc-release-" + [guid]::NewGuid())
New-Item -ItemType Directory $tmp | Out-Null
$file = Join-Path $tmp $asset
Copy-Item $setup $file
if (-not $Notes) { $Notes = "Green Campus เวอร์ชัน $Version" }
Write-Host "อัปโหลด $([IO.Path]::GetFileName($setup)) เป็น $asset ไปที่ $repo (v$Version)..." -ForegroundColor Green
gh release create "v$Version" $file --repo $repo --title "Green Campus $Version" --notes $Notes
Remove-Item $tmp -Recurse -Force
Write-Host "เสร็จแล้ว: https://github.com/$repo/releases/tag/v$Version" -ForegroundColor Cyan
