# 設定 Google Client Secret（手機 Safari/Chrome 導向登入用）
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Add-Type -AssemblyName Microsoft.VisualBasic
$secret = [Microsoft.VisualBasic.Interaction]::InputBox(
@'
請貼上 Google OAuth「用戶端密鑰」(Client secret)

位置：Google Cloud Console
→ 憑證 → 你的 Web 用戶端 (89740114064-...)
→ 用戶端密鑰

同時請確認已設定：
1. JavaScript 來源：https://sel-emotion-app.vercel.app
2. 重新導向 URI：https://sel-emotion-app.vercel.app/
3. OAuth 同意畫面 → 已授權網域：vercel.app
'@,
  'SEL - Google Client Secret',
  ''
)

if (-not $secret) { exit 0 }
$secret = $secret.Trim()
if ($secret.Length -lt 8) {
  [System.Windows.Forms.MessageBox]::Show('密鑰太短，請重新執行', 'SEL', 'OK', 'Warning') | Out-Null
  exit 1
}

$envPath = Join-Path $PSScriptRoot '.env'
$content = if (Test-Path $envPath) { Get-Content $envPath -Raw -Encoding UTF8 } else { '' }
if ($content -match '(?m)^GOOGLE_CLIENT_SECRET=.*$') {
  $content = $content -replace '(?m)^GOOGLE_CLIENT_SECRET=.*$', "GOOGLE_CLIENT_SECRET=$secret"
} else {
  if ($content -and -not $content.EndsWith("`n")) { $content += "`n" }
  $content += "GOOGLE_CLIENT_SECRET=$secret`n"
}
[System.IO.File]::WriteAllText($envPath, $content, [System.Text.UTF8Encoding]::new($false))

$secret | npx vercel env add GOOGLE_CLIENT_SECRET production --force 2>&1 | Out-Null

[System.Windows.Forms.MessageBox]::Show(
  "已寫入 .env 與 Vercel 環境變數 GOOGLE_CLIENT_SECRET`n`n請再執行一次部署，或等待自動部署完成後，用手機 Safari/Chrome 測試 Google 登入。",
  'SEL - 完成',
  'OK',
  'Information'
) | Out-Null
