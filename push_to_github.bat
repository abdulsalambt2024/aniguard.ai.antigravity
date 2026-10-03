@echo off
echo ==============================================
echo       AniGuard - Push to GitHub
echo ==============================================
echo.
echo Staging changes...
git add .
echo.
set /p commitMsg="Enter commit message (or press Enter for default): "
if "%commitMsg%"=="" set commitMsg=feat(aniguard): platform updates and optimizations
echo Committing with message: "%commitMsg%"...
git commit -m "%commitMsg%"
echo.
echo Pushing to GitHub (master branch)...
git push -u github master
if errorlevel 1 (
    echo.
    echo Checking if 'github' remote exists...
    git remote get-url github >nul 2>&1
    if errorlevel 1 (
        echo Remote 'github' not configured yet. Run:
        echo git remote add github https://github.com/YOUR_USERNAME/YOUR_REPO.git
    ) else (
        echo Push failed. Please check network or authentication credentials.
    )
)
echo.
echo Done!
pause
