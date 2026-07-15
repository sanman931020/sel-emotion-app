# 快速設定 Gemini API Key
# 用法：.\set-api-key.ps1 -Key "你的API金鑰"
param(
  [Parameter(Mandatory=$true)]
  [string]$Key
)

$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envFile)) {
  Copy-Item (Join-Path $PSScriptRoot ".env.example") $envFile
}

$content = Get-Content $envFile -Raw
if ($content -match '(?m)^GEMINI_API_KEY=.*$') {
  $content = $content -replace '(?m)^GEMINI_API_KEY=.*$', "GEMINI_API_KEY=$Key"
} else {
  $content += "`nGEMINI_API_KEY=$Key`n"
}
Set-Content -Path $envFile -Value $content.TrimEnd() -Encoding UTF8
Write-Host "已寫入 GEMINI_API_KEY 至 .env"
Write-Host "若伺服器正在運行，請重新啟動 npm run dev 使設定生效。"
