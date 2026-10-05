# FriendFolders one-click installer for Windows
$ErrorActionPreference = "Stop"

function Step($message) { Write-Host ""; Write-Host "==> $message" -ForegroundColor Cyan }
function Fail($message) {
    Write-Host ""; Write-Host "ERROR: $message" -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit 1
}

try {
    Step "Checking prerequisites"

    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Step "Installing Git"
        if (-not (Get-Command winget -ErrorAction SilentlyContinue)) { Fail "Git is required and winget was not found. Install Git, then run this installer again." }
        winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements
        $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")
    }

    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Step "Installing Node.js LTS"
        if (-not (Get-Command winget -ErrorAction SilentlyContinue)) { Fail "Node.js is required and winget was not found. Install Node.js LTS, then run this installer again." }
        winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
        $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")
    }

    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Step "Installing pnpm"
        npm install -g pnpm
        $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")
    }

    $vencord = Join-Path $HOME "Vencord"
    if (-not (Test-Path (Join-Path $vencord ".git"))) {
        Step "Downloading Vencord"
        git clone https://github.com/Vendicated/Vencord $vencord
    } else {
        Step "Updating Vencord"
        git -C $vencord pull --ff-only
    }

    Step "Installing Vencord dependencies"
    Push-Location $vencord
    pnpm install --frozen-lockfile

    $plugins = Join-Path $vencord "src\userplugins"
    New-Item -ItemType Directory -Force -Path $plugins | Out-Null
    $plugin = Join-Path $plugins "FriendFolders"

    if (Test-Path (Join-Path $plugin ".git")) {
        Step "Updating FriendFolders"
        git -C $plugin pull --ff-only
    } else {
        if (Test-Path $plugin) { Remove-Item $plugin -Recurse -Force }
        Step "Downloading FriendFolders"
        git clone https://github.com/nekoshinajun/FriendFolders $plugin
    }

    Step "Building Vencord"
    pnpm build

    Step "Opening Vencord installer"
    Write-Host "Select your Discord installation (normally Stable) when prompted." -ForegroundColor Yellow
    pnpm inject

    Pop-Location
    Write-Host ""
    Write-Host "FriendFolders installation finished!" -ForegroundColor Green
    Write-Host "Restart Discord, then enable FriendFolders in Settings > Vencord > Plugins."
    Read-Host "Press Enter to close"
} catch {
    try { Pop-Location -ErrorAction SilentlyContinue } catch {}
    Fail $_.Exception.Message
}
