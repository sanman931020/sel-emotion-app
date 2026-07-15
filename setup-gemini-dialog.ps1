# 一鍵設定 Gemini API Key（彈出輸入視窗）
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

Add-Type -AssemblyName Microsoft.VisualBasic
Add-Type -AssemblyName System.Windows.Forms

[System.Windows.Forms.MessageBox]::Show(
  "即將開啟 Google AI Studio 取得免費 API Key。`n`n複製金鑰後，在下一個視窗貼上即可。",
  'SEL 情緒支持系統 — Gemini 設定',
  [System.Windows.Forms.MessageBoxButtons]::OK,
  [System.Windows.Forms.MessageBoxIcon]::Information
) | Out-Null

Start-Process 'https://aistudio.google.com/apikey'

$key = [Microsoft.VisualBasic.Interaction]::InputBox(
  "請貼上 Gemini API Key：`n（從 Google AI Studio 複製）",
  'SEL — 貼上 API Key',
  ''
).Trim()

if (-not $key -or $key.Length -lt 12) {
  [System.Windows.Forms.MessageBox]::Show('未輸入有效金鑰，設定已取消。', 'SEL', 'OK', 'Warning') | Out-Null
  exit 1
}

if (-not (Test-Path .env)) { Copy-Item .env.example .env }

$content = Get-Content .env -Raw
$content = $content -replace '(?m)^GEMINI_API_KEY=.*$', "GEMINI_API_KEY=$key"
Set-Content .env -Value $content.TrimEnd() -Encoding UTF8

# 同步寫入前端 localStorage 用的 JSON（供手動匯入備份）
$keyMeta = @{ savedAt = (Get-Date).ToString('o'); hint = ($key.Substring(0,6) + '...') } | ConvertTo-Json
Set-Content '.gemini-key-hint.json' -Value $keyMeta -Encoding UTF8

# 測試 API
$body = @{
  messages = @(
    @{ role = 'assistant'; content = '你好，我是你的心靈夥伴。' },
    @{ role = 'user'; content = '我最近準備考試覺得好沒用，很想放棄' }
  )
  context = @{ companionName = '心靈夥伴'; emotions = @('焦慮'); events = @('學業壓力') }
  clientApiKey = $key
} | ConvertTo-Json -Depth 5

try {
  $resp = Invoke-RestMethod -Uri 'http://localhost:3000/api/chat' -Method POST -Body $body -ContentType 'application/json; charset=utf-8'
  $preview = if ($resp.reply.Length -gt 120) { $resp.reply.Substring(0, 120) + '…' } else { $resp.reply }
  [System.Windows.Forms.MessageBox]::Show(
    "Gemini 連線成功！`n`n回覆預覽：`n$preview`n`n請以 http://localhost:3000/emotion-app.html 開啟 App，`n並至「設定 → AI 對話連線」貼上相同金鑰。",
    'SEL — 設定完成',
    'OK',
    'Information'
  ) | Out-Null
} catch {
  [System.Windows.Forms.MessageBox]::Show(
    "金鑰已寫入 .env，但 API 測試失敗：`n$($_.Exception.Message)`n`n請確認 start-dev.bat 已執行。",
    'SEL — 部分完成',
    'OK',
    'Warning'
  ) | Out-Null
}

exit 0
