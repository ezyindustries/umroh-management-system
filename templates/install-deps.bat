@echo off
REM Windows Batch installer for EzyIndustries Platform dependencies
REM Usage: install-deps.bat

echo.
echo ========================================
echo EzyIndustries Platform - Windows Setup
echo ========================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with Administrator privileges
) else (
    echo WARNING: Some installations may require Administrator privileges
    echo Right-click and "Run as Administrator" if installations fail
    echo.
)

REM Check Windows version
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo Detected Windows version: %VERSION%
echo.

REM Function to check if command exists
:check_command
where %1 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [32m✓ %1 found[0m
    goto :eof
) else (
    echo [33m! %1 not found[0m
    goto :eof
)

echo Checking existing tools...
call :check_command ssh
call :check_command curl
call :check_command docker
call :check_command git

echo.
echo ========================================
echo Installing Dependencies
echo ========================================

REM Check for package manager
where choco >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PKG_MGR=choco
    echo Using Chocolatey package manager
    goto install_deps
)

where winget >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PKG_MGR=winget
    echo Using Winget package manager
    goto install_deps
)

echo.
echo [31mNo package manager found![0m
echo.
echo Please install one of the following:
echo 1. Chocolatey: https://chocolatey.org/install
echo 2. Windows Package Manager (winget) - comes with Windows 10 1809+
echo.
echo Alternative manual installations:
echo - Git Bash: https://git-scm.com/download/win
echo - Docker Desktop: https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe
echo.
pause
exit /b 1

:install_deps

echo.
echo Installing SSH client (via Git)...
if "%PKG_MGR%"=="choco" (
    choco install git -y
) else (
    winget install --id Git.Git -e --source winget
)

echo.
echo Installing Docker Desktop...
if "%PKG_MGR%"=="choco" (
    choco install docker-desktop -y
) else (
    winget install --id Docker.DockerDesktop -e --source winget
)

echo.
echo Installing curl (if not already available)...
REM curl is built-in on Windows 10 1803+ and Windows 11
where curl >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if "%PKG_MGR%"=="choco" (
        choco install curl -y
    ) else (
        echo curl should be available on Windows 10+
        echo If not, download from: https://curl.se/windows/
    )
) else (
    echo curl already available
)

echo.
echo ========================================
echo Post-Installation Notes
echo ========================================
echo.
echo [33mIMPORTANT:[0m
echo 1. Restart your terminal/command prompt after installation
echo 2. Docker Desktop needs to be running for container operations
echo 3. Use Git Bash for running deployment scripts (recommended)
echo 4. Alternative: Use WSL (Windows Subsystem for Linux)
echo.
echo [32mNext steps:[0m
echo 1. Open Git Bash or PowerShell
echo 2. Copy templates: copy templates\*.yml .\my-project\
echo 3. Edit configs: notepad my-project\server-config.yml
echo 4. Deploy: bash scripts/deploy.sh staging ./my-project
echo.

REM Final verification
echo ========================================
echo Verification
echo ========================================
echo.
echo Checking installations...
call :check_command ssh
call :check_command curl  
call :check_command docker
call :check_command git

echo.
echo [32mInstallation completed![0m
echo.
echo For best experience, use Git Bash to run deployment scripts:
echo   bash scripts/deploy.sh staging ./my-project
echo.
pause