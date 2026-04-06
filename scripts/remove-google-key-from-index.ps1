# Run from project root if GitHub blocked push due to secret scanning (gongju*.json).
# Keeps the file on disk; only removes it from Git tracking.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Get-ChildItem -Path $root -Filter 'gongju*.json' -File -ErrorAction SilentlyContinue | ForEach-Object {
  git rm --cached -- $_.FullName 2>$null
  Write-Host "Removed from index: $($_.Name)"
}

$left = git ls-files | Select-String -Pattern 'gongju.*\.json$'
if ($left) { Write-Host "Still tracked:"; $left; exit 1 }

Write-Host "OK. Commit and push:"
Write-Host '  git commit -m "Remove service account JSON from repository"'
Write-Host '  git push origin main --force'
