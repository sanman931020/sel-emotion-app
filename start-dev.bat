@echo off
chcp 65001 >nul
cd /d "%~dp0"
title SEL App — AI 對話伺服器

set "PATH=C:\Program Files\nodejs;%PATH%"

where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo [錯誤] 未偵測到 Node.js
  echo 請先安裝：https://nodejs.org/ （選擇 LTS 版本）
  echo 安裝後重新執行此腳本。
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo 正在安裝依賴套件...
  call npm install
)

if not exist .env (
  echo 正在建立 .env（請填入 GEMINI_API_KEY）...
  copy .env.example .env >nul
  echo.
  echo 請用記事本開啟 .env，將 GEMINI_API_KEY 改為你的 API Key
  echo 取得金鑰：https://aistudio.google.com/apikey
  echo.
  echo Google 登入：執行 setup-google-oauth.ps1 或於 .env 設定 GOOGLE_CLIENT_ID
  echo.
  notepad .env
)

echo.
echo 啟動伺服器後，請用瀏覽器開啟：
echo   http://localhost:3000/emotion-app.html
echo.
echo 對話頁標題下方應顯示「Gemini 專業陪伴中」（綠色）
echo 若顯示「離線模板」代表 API 未連線。
echo.

call npm run dev
