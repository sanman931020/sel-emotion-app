# 修復 Google OAuth origin_mismatch — 複製來源網址並開啟 Console
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$clientId = '733104291212-ged0fhk8t1buuimul003unt4rdspa59b.apps.googleusercontent.com'
$origins = @(
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
) -join "`r`n"

Set-Clipboard -Value $origins

$credUrl = 'https://console.cloud.google.com/apis/credentials'
$appUrl = 'http://127.0.0.1:5500/emotion-app.html'

Start-Process $credUrl
Start-Sleep -Seconds 1
Start-Process $appUrl

Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.MessageBox]::Show(
@"

Google 登入錯誤 origin_mismatch — 修復步驟

已複製以下「JavaScript 來源」到剪貼簿：
  http://127.0.0.1:5500   ← Live Server（你目前使用的）
  http://localhost:5500
  http://localhost:3000
  http://127.0.0.1:3000

1. Google Cloud Console → 憑證
2. OAuth 2.0 用戶端 ID（網頁應用程式）：
   $clientId
3. 「已授權的 JavaScript 來源」→ 新增以上網址（貼上即可）
   ※ 填在 JavaScript 來源，不是重新導向 URI
4. 儲存，等待約 1 分鐘
5. 在 app 分頁 Ctrl+F5，再試 Google 登入

"@,
  'SEL — 修復 Google OAuth',
  [System.Windows.Forms.MessageBoxButtons]::OK,
  [System.Windows.Forms.MessageBoxIcon]::Information
) | Out-Null
