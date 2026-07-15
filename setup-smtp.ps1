# Configure SMTP for automatic share emails (Gmail)
# Usage:
#   .\setup-smtp.ps1
#   .\setup-smtp.ps1 -Email "you@gmail.com" -AppPassword "xxxx xxxx xxxx xxxx"
param(
  [string]$Email = '',
  [string]$AppPassword = ''
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Add-Type -AssemblyName Microsoft.VisualBasic
Add-Type -AssemblyName System.Windows.Forms

function Show-Info([string]$text, [string]$title) {
  [System.Windows.Forms.MessageBox]::Show(
    $text, $title,
    [System.Windows.Forms.MessageBoxButtons]::OK,
    [System.Windows.Forms.MessageBoxIcon]::Information
  ) | Out-Null
}

function Show-Warn([string]$text, [string]$title) {
  [System.Windows.Forms.MessageBox]::Show(
    $text, $title,
    [System.Windows.Forms.MessageBoxButtons]::OK,
    [System.Windows.Forms.MessageBoxIcon]::Warning
  ) | Out-Null
}

if (-not $Email -or -not $AppPassword) {
  Show-Info @(
    '心靈夥伴 — 自動寄信設定',
    '',
    '系統會代你寄送「心情摘要」給暖心支持對象。',
    '',
    '請使用個人 Gmail（不要用學校信箱）：',
    '1. 開啟兩步驟驗證',
    '2. 前往 https://myaccount.google.com/apppasswords',
    '3. 新增「郵件」應用程式密碼，複製 16 碼',
    '4. 在接下來的視窗填入 Email 與應用程式密碼'
  ) -join "`r`n" 'SEL - SMTP 設定'
}

if (-not $Email) {
  $Email = [Microsoft.VisualBasic.Interaction]::InputBox(
    "寄件用 Email（請填個人 Gmail，例如 xxx@gmail.com）`r`n`r`n不要用學校信箱（如 @go.utaipei.edu.tw）。",
    'SEL - SMTP 帳號',
    ''
  ).Trim()
}

if (-not $Email -or $Email -notmatch '@') {
  Show-Warn '已取消：Email 無效。' 'SEL'
  exit 1
}

if ($Email -match '@go\.|\.edu(\.[a-z]+)?$|utaipei') {
  $continueSchool = [System.Windows.Forms.MessageBox]::Show(
    ("偵測到學校／教育信箱：`r`n{0}`r`n`r`n多數學校 Google 禁止應用程式密碼。`r`n強烈建議改用個人 Gmail。`r`n`r`n仍要繼續嗎？" -f $Email),
    'SEL - 建議改用個人 Gmail',
    [System.Windows.Forms.MessageBoxButtons]::YesNo,
    [System.Windows.Forms.MessageBoxIcon]::Warning
  )
  if ($continueSchool -ne [System.Windows.Forms.DialogResult]::Yes) {
    exit 1
  }
}

if (-not $AppPassword) {
  $AppPassword = [Microsoft.VisualBasic.Interaction]::InputBox(
    '應用程式密碼（16 碼，可含空白，系統會自動去掉）：',
    'SEL - SMTP 密碼',
    ''
  )
}

$pass = ($AppPassword | ForEach-Object { $_.Trim() }) -replace '\s', ''
if (-not $pass -or $pass.Length -lt 8) {
  Show-Warn '已取消：密碼太短。' 'SEL'
  exit 1
}

$envFile = Join-Path $PSScriptRoot '.env'
if (-not (Test-Path $envFile)) {
  Copy-Item (Join-Path $PSScriptRoot '.env.example') $envFile
}

$content = Get-Content $envFile -Raw -Encoding UTF8
if ($null -eq $content) { $content = '' }

$fromLine = "SMTP_FROM=SEL <$Email>"

function Set-EnvLine([string]$src, [string]$key, [string]$value) {
  $pattern = "(?m)^$([regex]::Escape($key))=.*$"
  if ($src -match $pattern) {
    return [regex]::Replace($src, $pattern, ($key + '=' + $value), 1)
  }
  return ($src.TrimEnd() + "`r`n" + $key + '=' + $value + "`r`n")
}

$content = Set-EnvLine $content 'SMTP_HOST' 'smtp.gmail.com'
$content = Set-EnvLine $content 'SMTP_PORT' '587'
$content = Set-EnvLine $content 'SMTP_SECURE' 'false'
$content = Set-EnvLine $content 'SMTP_USER' $Email
$content = Set-EnvLine $content 'SMTP_PASS' $pass
$content = Set-EnvLine $content 'SMTP_FROM' ("SEL <" + $Email + ">")

# Prefer labeled SMTP block marker if present
if ($content -notmatch '(?m)^# SMTP') {
  $content = $content.TrimEnd() + "`r`n`r`n# SMTP - auto send to warm support contacts`r`n"
}

[System.IO.File]::WriteAllText(
  $envFile,
  $content.TrimEnd() + "`r`n",
  (New-Object System.Text.UTF8Encoding $false)
)

$verifyScript = @'
import 'dotenv/config';
import nodemailer from 'nodemailer';
const port = Number(process.env.SMTP_PORT) || 587;
const secure = process.env.SMTP_SECURE === 'true' || port === 465;
const t = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure,
  requireTLS: !secure && port === 587,
  auth: {
    user: (process.env.SMTP_USER || '').trim(),
    pass: (process.env.SMTP_PASS || '').trim().replace(/\s/g, ''),
  },
});
try {
  await t.verify();
  console.log('OK');
} catch (e) {
  console.error('FAIL:' + (e && e.message ? e.message : String(e)));
  process.exit(1);
}
'@

$verifyFile = Join-Path $env:TEMP 'sel-smtp-verify.mjs'
[System.IO.File]::WriteAllText($verifyFile, $verifyScript, (New-Object System.Text.UTF8Encoding $false))

$verifyOk = $false
$verifyMsg = ''
try {
  $out = & node $verifyFile 2>&1 | Out-String
  if ($LASTEXITCODE -eq 0 -and $out -match 'OK') {
    $verifyOk = $true
  } else {
    $verifyMsg = $out.Trim()
  }
} catch {
  $verifyMsg = $_.Exception.Message
}

if ($verifyOk) {
  Show-Info "設定成功，SMTP 登入驗證通過！`r`n`r`n請重新啟動 npm run dev，之後點「分享」就會由系統代為寄出。" 'SEL - 完成'
  Write-Output 'SMTP_OK'
  exit 0
}

Show-Warn ("已寫入 .env，但登入驗證失敗。`r`n`r`n常見原因：`r`n• 填的是一般密碼，不是應用程式密碼`r`n• 學校 Google 未開放應用程式密碼（請改個人 Gmail）`r`n• 兩步驟驗證未開啟`r`n`r`n錯誤訊息：`r`n" + $verifyMsg) 'SEL - 驗證失敗'
Write-Output ('SMTP_FAIL:' + $verifyMsg)
exit 1
