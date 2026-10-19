@echo off
chcp 65001 > nul
echo ========================================================
echo   CAP NHAT THOI KHOA BIEU GIANG VIEN (GVGD) TU FILE PDF
echo ========================================================
python "%~dp0scripts\update_teachers.py" %*
pause
