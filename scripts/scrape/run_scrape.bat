@echo off
REM Pełny mirror BodyWork (104 URL-e z sitemap.xml)
REM Używa Python 3.13 z pipem (nie Espressif python z PATH)

cd /d "%~dp0"
set PYTHON=C:\Users\norke\AppData\Local\Programs\Python\Python313\python.exe

"%PYTHON%" -m pip install -r "%~dp0requirements-scrape.txt" -q
"%PYTHON%" "%~dp0scrape_site.py" %*
