@echo off
pushd %~dp0
cd ..\..
set NODE_ENV=production
node server.js --demo %*
pause
popd
