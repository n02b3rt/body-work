@echo off
REM Lokalny podglad mirroru BodyWork (NIE uzywaj file://)
cd /d "%~dp0scraped"
echo.
echo Serwer: http://localhost:8765/
echo Przyklad: http://localhost:8765/kontakt/
echo Zatrzymaj: Ctrl+C
echo.
C:\Users\norke\AppData\Local\Programs\Python\Python313\python.exe -m http.server 8765
