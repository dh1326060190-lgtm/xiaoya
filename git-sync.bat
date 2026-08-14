@echo off
REM 小芽工作台 · 一键同步脚本
REM 双击本文件即可把当前所有改动提交进本地 git 仓库
cd /d "%~dp0"
git add -A
git diff --cached --quiet
if %errorlevel%==0 (
  echo [git-sync] No changes to commit.
) else (
  for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HHmm"') do set TS=%%i
  git commit -m "sync: %TS%"
  echo [git-sync] Committed at %TS%.
)
git status --short
pause
