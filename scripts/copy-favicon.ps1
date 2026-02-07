# Copy favicon from static/img to repository root (PowerShell)
# Usage: .\scripts\copy-favicon.ps1

$src = "static/img/favicon.ico"
$dst = "favicon.ico"

if (Test-Path $src) {
    Copy-Item -Path $src -Destination $dst -Force
    Write-Host "Copied $src to $dst"
} else {
    Write-Host "Source file not found: $src" -ForegroundColor Yellow
}
