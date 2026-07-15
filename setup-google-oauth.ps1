# 設定 Google OAuth 用戶端 ID（供 Google 登入使用）
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Add-Type -AssemblyName Microsoft.VisualBasic
Add-Type -AssemblyName System.Windows.Forms

[System.Windows.Forms.MessageBox]::Show(
  "Open Google Cloud Console to create OAuth 2.0 Client ID.`n`nType: Web application`nAuthorized JavaScript origins: http://localhost:3000",
  "SEL - Google Login Setup",
  [System.Windows.Forms.MessageBoxButtons]::OK,
  [System.Windows.Forms.MessageBoxIcon]::Information
) | Out-Null

Start-Process 'https://console.cloud.google.com/apis/credentials'

$clientId = [Microsoft.VisualBasic.Interaction]::InputBox(
  "Paste OAuth Client ID (ends with .apps.googleusercontent.com):",
  "SEL - Google OAuth Client ID",
  ''
).Trim()

if (-not $clientId -or $clientId.Length -lt 12) {
  [System.Windows.Forms.MessageBox]::Show("No valid Client ID. Cancelled.", "SEL") | Out-Null
  exit 1
}

$envFile = Join-Path $PSScriptRoot '.env'
if (-not (Test-Path $envFile)) {
  Copy-Item (Join-Path $PSScriptRoot '.env.example') $envFile
}

$content = Get-Content $envFile -Raw -Encoding UTF8
if ($content -match '(?m)^GOOGLE_CLIENT_ID=.*$') {
  $content = $content -replace '(?m)^GOOGLE_CLIENT_ID=.*$', "GOOGLE_CLIENT_ID=$clientId"
} else {
  $content += "`nGOOGLE_CLIENT_ID=$clientId`n"
}
Set-Content -Path $envFile -Value $content.TrimEnd() -Encoding UTF8

$configJs = Join-Path $PSScriptRoot 'google-auth.config.js'
$js = @"
/**
 * Google OAuth 2.0 用戶端 ID
 */
window.SEL_GOOGLE_AUTH = {
  clientId: '$clientId'
};
"@
Set-Content -Path $configJs -Value $js -Encoding UTF8

[System.Windows.Forms.MessageBox]::Show(
  "Saved .env and google-auth.config.js.`n`nPlease restart start-dev.bat, then open http://localhost:3000/emotion-app.html",
  "SEL - Done",
  [System.Windows.Forms.MessageBoxButtons]::OK,
  [System.Windows.Forms.MessageBoxIcon]::Information
) | Out-Null
