<#
.SYNOPSIS
SillyTavern autodeploy script
.DESCRIPTION
Install Node.js，refearsh Session env，install npm dependency.
#>

$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Administrator privileges required. Restarting with elevated permissions..."
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Set-Location $PSScriptRoot
$msi = Get-ChildItem -Path $PSScriptRoot -Filter "node-*.msi" | Select-Object -First 1
if (-not $msi) {
    Write-Error "Node.js MSI installer not found."
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "Installing $($msi.Name)..." -ForegroundColor Cyan
$proc = Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$($msi.FullName)`" /qn /norestart" -Wait -PassThru
if ($proc.ExitCode -ne 0) {
    Write-Error "Installation failed, error code: $($proc.ExitCode)"
    exit
}

Write-Host "Refreshing environment variables..." -ForegroundColor Cyan
$machinePath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::Machine)
$userPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)

$env:Path = $machinePath + ";" + $userPath

try {
    $version = node -v
    Write-Host "Node version detected: $version" -ForegroundColor Green
} catch {
    Write-Warning "Could not detect Node automatically. Attempting to add path manually..."
    $env:Path += ";C:\Program Files\nodejs\"
}

# Switch to project root directory
Set-Location "$PSScriptRoot\.."

Write-Host "Installing dependencies..." -ForegroundColor Cyan
$env:NODE_ENV = "production"

Start-Process cmd -ArgumentList "/c npm install --no-audit --no-fund --loglevel=error --no-progress --omit=dev" -Wait

Read-Host "Press Enter to exit"