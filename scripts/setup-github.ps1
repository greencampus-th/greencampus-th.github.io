# One-time setup: creates the GitHub repository, uploads this site and turns on GitHub Pages.
# Run from PowerShell in this folder:   .\scripts\setup-github.ps1
# Needs: git, GitHub CLI (winget install --id GitHub.cli) and "gh auth login" done once.
# git/gh print progress and warnings on stderr; Windows PowerShell would treat that as an error,
# so check exit codes instead of stopping on stderr
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$site = Split-Path -Parent $PSScriptRoot
Set-Location $site
# the site lives in the greencampus-th organization; a repo named <owner>.github.io is served at https://<owner>.github.io/
$owner = 'greencampus-th'
$name = 'greencampus-th.github.io'

gh auth status *> $null
if ($LASTEXITCODE -ne 0) { Write-Host 'ยังไม่ได้ล็อกอิน GitHub: พิมพ์  gh auth login  ก่อน' -ForegroundColor Yellow; exit 1 }
$user = gh api user --jq .login
Write-Host "บัญชี GitHub: $user" -ForegroundColor Green

# point the download button at this repository
$cfgPath = Join-Path $site 'config.js'
$cfg = Get-Content $cfgPath -Raw -Encoding UTF8
$cfg = $cfg -replace "repo: '[^']*'", "repo: '$owner/$name'"
[IO.File]::WriteAllText($cfgPath, $cfg, (New-Object Text.UTF8Encoding $false))

if (-not (Test-Path (Join-Path $site '.git'))) { git init -q; git branch -M main }
git add -A
git commit -q -m "Green Campus download site" 2>$null
gh repo view "$owner/$name" *> $null
if ($LASTEXITCODE -ne 0) {
  gh repo create "$owner/$name" --public --source . --remote origin --push --description 'Green Campus: ดาวน์โหลดเกมสำรวจวิทยาลัยอาชีวศึกษาสุราษฎร์ธานีแบบ 3 มิติ'
} else {
  if (-not (git remote 2>$null | Select-String origin)) { git remote add origin "https://github.com/$owner/$name.git" }
  git push -u origin main
}

# GitHub Pages from the main branch root (ignore "already exists")
gh api -X POST "repos/$owner/$name/pages" -f 'source[branch]=main' -f 'source[path]=/' *> $null
Write-Host ''
Write-Host "เว็บดาวน์โหลด (รอ 1-2 นาทีครั้งแรก): https://$owner.github.io/" -ForegroundColor Cyan
Write-Host 'ขั้นต่อไป: อัปโหลดไฟล์ติดตั้งด้วย  .\scripts\publish-release.ps1 1.0.0' -ForegroundColor Cyan
