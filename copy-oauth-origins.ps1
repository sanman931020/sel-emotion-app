# Copy OAuth origins and open the exact OAuth client edit page
$clientNum = '733104291212-ged0fhk8t1buuimul003unt4rdspa59b'
$origins = @(
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
) -join [Environment]::NewLine

Set-Clipboard -Value $origins
Start-Process "https://console.cloud.google.com/apis/credentials/oauthclient/$clientNum"
Start-Sleep -Milliseconds 800
Start-Process 'https://console.cloud.google.com/apis/credentials/consent'
Start-Sleep -Milliseconds 500
Start-Process 'http://localhost:3000/emotion-app.html'
Write-Host "Done: origins copied. Opened OAuth client + consent + localhost:3000 app."
