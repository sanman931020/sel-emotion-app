# Copy OAuth origins and open the exact OAuth client edit page
$clientNum = '89740114064-rmb3njnqtdsn6gomstsgkp1fkfvc7urj'
$origins = @(
  'https://sel-emotion-app.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  '',
  'REDIRECT_URI: https://sel-emotion-app.vercel.app/',
  '',
  'AUTHORIZED_DOMAIN: vercel.app'
) -join [Environment]::NewLine

Set-Clipboard -Value $origins
Start-Process "https://console.cloud.google.com/apis/credentials/oauthclient/$clientNum"
Start-Sleep -Milliseconds 800
Start-Process 'https://console.cloud.google.com/apis/credentials/consent'
Start-Sleep -Milliseconds 500
Start-Process 'https://sel-emotion-app.vercel.app/'
Write-Host "Done: origins copied. Opened OAuth client + consent + production app."
