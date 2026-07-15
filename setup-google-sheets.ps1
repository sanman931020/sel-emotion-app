# Configure Google Sheets webhook for SEL analytics backend
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Add-Type -AssemblyName Microsoft.VisualBasic
Add-Type -AssemblyName System.Windows.Forms

[System.Windows.Forms.MessageBox]::Show(
@"
心靈夥伴 — Google 試算表後端設定

1. 新建一個 Google 試算表
2. 擴充功能 → Apps Script
3. 用編輯器開啟專案內的 google-sheets-apps-script.js，
   複製全部內容貼到 Apps Script 並儲存
4. 部署 → 新增部署 → 網頁應用程式
   · 執行身分：我
   · 存取權：任何人
5. 複製部署後的網址，貼到下一個輸入框

完成後重啟 npm run dev，每次使用者完成對話並評分，
資料會自動寫進試算表「使用紀錄」分頁。
"@,
  'SEL - Google Sheets',
  [System.Windows.Forms.MessageBoxButtons]::OK,
  [System.Windows.Forms.MessageBoxIcon]::Information
) | Out-Null

# Open Apps Script helper file for easy copy
$scriptPath = Join-Path $PSScriptRoot 'google-sheets-apps-script.js'
if (Test-Path $scriptPath) {
  Start-Process notepad.exe $scriptPath
}
Start-Process 'https://sheets.new'

$url = [Microsoft.VisualBasic.Interaction]::InputBox(
  "貼上 Apps Script「網頁應用程式」網址（https://script.google.com/macros/s/.../exec）：",
  'SEL - Sheets Webhook',
  ''
).Trim()

if (-not $url -or $url -notmatch '^https://script\.google\.com/') {
  [System.Windows.Forms.MessageBox]::Show(
    '已取消：請貼上正確的 script.google.com 網頁應用程式網址。',
    'SEL'
  ) | Out-Null
  exit 1
}

$envFile = Join-Path $PSScriptRoot '.env'
if (-not (Test-Path $envFile)) {
  Copy-Item (Join-Path $PSScriptRoot '.env.example') $envFile
}

$content = [System.IO.File]::ReadAllText($envFile)
$line = "GOOGLE_SHEETS_WEBHOOK_URL=$url"
if ($content -match '(?m)^GOOGLE_SHEETS_WEBHOOK_URL=.*$') {
  $content = [regex]::Replace($content, '(?m)^GOOGLE_SHEETS_WEBHOOK_URL=.*$', $line, 1)
} else {
  $content = $content.TrimEnd() + "`r`n`r`n# Google Sheets analytics webhook`r`n" + $line + "`r`n"
}
[System.IO.File]::WriteAllText($envFile, $content.TrimEnd() + "`r`n", (New-Object System.Text.UTF8Encoding $false))

# Quick ping
try {
  $resp = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing -TimeoutSec 20
  $body = $resp.Content
  if ($body -match 'ok') {
    [System.Windows.Forms.MessageBox]::Show(
      "已寫入 .env，且能連線到 Apps Script。`n`n請重啟 npm run dev。",
      'SEL - 完成',
      [System.Windows.Forms.MessageBoxButtons]::OK,
      [System.Windows.Forms.MessageBoxIcon]::Information
    ) | Out-Null
  } else {
    [System.Windows.Forms.MessageBox]::Show(
      "已寫入 .env。`n若稍後寫入失敗，請確認 Apps Script 已部署且存取權為「任何人」。`n`n回應：$body",
      'SEL - 已儲存',
      [System.Windows.Forms.MessageBoxButtons]::OK,
      [System.Windows.Forms.MessageBoxIcon]::Warning
    ) | Out-Null
  }
} catch {
  [System.Windows.Forms.MessageBox]::Show(
    "已寫入 .env，但測試連線失敗：`n$($_.Exception.Message)`n`n請確認部署後重啟 npm run dev。",
    'SEL - 已儲存',
    [System.Windows.Forms.MessageBoxButtons]::OK,
    [System.Windows.Forms.MessageBoxIcon]::Warning
  ) | Out-Null
}

Write-Output 'SHEETS_WEBHOOK_SAVED'
