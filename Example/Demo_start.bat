@echo off
pushd %~dp0
cd ..
set NODE_ENV=production
call npm install --no-audit --no-fund --loglevel=error --no-progress --omit=dev
node server.js --demo %*
pause
popd
