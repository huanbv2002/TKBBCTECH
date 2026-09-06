@echo off
chcp 65001 > nul
echo ========================================================
echo   CAP NHAT THOI KHOA BIEU TU DONG TU FILE PDF
echo ========================================================
python "%~dp0scripts\update_tkb.py" %*
pause
