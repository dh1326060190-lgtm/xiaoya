@echo off
setlocal enabledelayedexpansion
REM 小芽工作台 · 一键同步脚本
REM 双击本文件即可：① 把当前所有改动提交进本地 git 仓库；② 若 github-token.txt 存在，自动推送到 GitHub
cd /d "%~dp0"

git add -A
git diff --cached --quiet
if !errorlevel!==0 (
  echo [git-sync] 没有需要提交的改动。
) else (
  for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HHmm"') do set TS=%%i
  git commit -m "sync: !TS!"
  echo [git-sync] 已提交：!TS!
)

if exist "github-token.txt" (
  set /p GHTOKEN=<github-token.txt
  if not "!GHTOKEN!"=="" (
    echo [git-sync] 检测到令牌，正在推送到 GitHub ...
    git remote set-url origin https://!GHTOKEN!@github.com/dh1326060190-lgtm/xiaoya.git
    git push origin master
    git remote set-url origin https://github.com/dh1326060190-lgtm/xiaoya.git
    if !errorlevel!==0 (
      echo [git-sync] 已推送到 GitHub。
    ) else (
      echo [git-sync] 推送失败，请检查令牌是否有效或仓库地址是否正确。
    )
  ) else (
    echo [git-sync] github-token.txt 为空，已跳过推送。
  )
) else (
  echo [git-sync] 未找到 github-token.txt，已跳过推送（仅本地提交）。
  echo [git-sync] 如需自动推送，请新建 github-token.txt（内容为一行 GitHub PAT，需 repo 权限）。
)

git status --short
pause
endlocal
