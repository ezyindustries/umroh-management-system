# PowerShell installer for EzyIndustries Platform dependencies
# Usage: PowerShell -ExecutionPolicy Bypass -File install-deps.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "EzyIndustries Platform - PowerShell Setup" -ForegroundColor Blue  
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($isAdmin) {
    Write-Host "✓ Running with Administrator privileges" -ForegroundColor Green
} else {
    Write-Host "⚠ Some installations may require Administrator privileges" -ForegroundColor Yellow
    Write-Host "Right-click PowerShell and 'Run as Administrator' if installations fail" -ForegroundColor Yellow
    Write-Host ""
}

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check existing tools
Write-Host "Checking existing tools..." -ForegroundColor Yellow
$tools = @('ssh', 'curl', 'docker', 'git')
foreach ($tool in $tools) {
    if (Test-Command $tool) {
        Write-Host "✓ $tool found" -ForegroundColor Green
    } else {
        Write-Host "! $tool not found" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "Installing Dependencies" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue

# Check for package managers
$useWinget = Test-Command 'winget'
$useChoco = Test-Command 'choco'

if ($useWinget) {
    Write-Host "Using Windows Package Manager (winget)" -ForegroundColor Green
    $pkgMgr = "winget"
} elseif ($useChoco) {
    Write-Host "Using Chocolatey package manager" -ForegroundColor Green
    $pkgMgr = "choco"
} else {
    Write-Host "No package manager found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install one of the following:"
    Write-Host "1. Windows Package Manager (winget) - comes with Windows 10 1809+"
    Write-Host "2. Chocolatey: https://chocolatey.org/install"
    Write-Host ""
    Write-Host "Alternative manual installations:"
    Write-Host "- Git Bash: https://git-scm.com/download/win"
    Write-Host "- Docker Desktop: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Install Git (includes SSH client)
Write-Host ""
Write-Host "Installing Git (includes SSH client)..." -ForegroundColor Yellow
try {
    if ($pkgMgr -eq "winget") {
        winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
    } else {
        choco install git -y
    }
    Write-Host "✓ Git installed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to install Git: $_" -ForegroundColor Red
}

# Install Docker Desktop
Write-Host ""
Write-Host "Installing Docker Desktop..." -ForegroundColor Yellow
try {
    if ($pkgMgr -eq "winget") {
        winget install --id Docker.DockerDesktop -e --source winget --accept-package-agreements --accept-source-agreements
    } else {
        choco install docker-desktop -y
    }
    Write-Host "✓ Docker Desktop installed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to install Docker Desktop: $_" -ForegroundColor Red
}

# Check curl (built-in on Windows 10 1803+)
Write-Host ""
Write-Host "Checking curl availability..." -ForegroundColor Yellow
if (Test-Command 'curl') {
    Write-Host "✓ curl already available" -ForegroundColor Green
} else {
    Write-Host "Installing curl..." -ForegroundColor Yellow
    try {
        if ($pkgMgr -eq "choco") {
            choco install curl -y
        } else {
            Write-Host "curl should be available on Windows 10+. If not, download from: https://curl.se/windows/" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "✗ Failed to install curl: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "Post-Installation Notes" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "1. Restart PowerShell/Terminal after installation"
Write-Host "2. Docker Desktop needs to be running for container operations"
Write-Host "3. Use Git Bash for running deployment scripts (recommended)"
Write-Host "4. Alternative: Use WSL (Windows Subsystem for Linux)"
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Open Git Bash or PowerShell"  
Write-Host "2. Copy templates: Copy-Item templates\*.yml .\my-project\"
Write-Host "3. Edit configs: notepad my-project\server-config.yml"
Write-Host "4. Deploy: bash scripts/deploy.sh staging ./my-project"
Write-Host ""

# Final verification
Write-Host "========================================" -ForegroundColor Blue
Write-Host "Verification" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Checking installations..." -ForegroundColor Yellow
$finalTools = @('ssh', 'curl', 'docker', 'git')
$allGood = $true

foreach ($tool in $finalTools) {
    if (Test-Command $tool) {
        Write-Host "✓ $tool available" -ForegroundColor Green
    } else {
        Write-Host "✗ $tool not found" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
if ($allGood) {
    Write-Host "Installation completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Some tools are missing. You may need to restart your terminal or install manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "For best experience, use Git Bash to run deployment scripts:" -ForegroundColor Cyan
Write-Host "  bash scripts/deploy.sh staging ./my-project" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"