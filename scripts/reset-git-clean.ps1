# Run once in PowerShell (project root or any folder):
#   powershell -ExecutionPolicy Bypass -File .\scripts\reset-git-clean.ps1
#
# Removes all Git history, creates one commit without node_modules, force-pushes to GitHub.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$log = Join-Path $root '_git_reset_log.txt'
"" | Out-File $log -Encoding utf8

function Log($msg) { Add-Content $log $msg; Write-Host $msg }

try {
  if (Test-Path (Join-Path $root '.git')) {
    Remove-Item -Recurse -Force (Join-Path $root '.git')
    Log 'Removed .git'
  }

  git init
  git add -A
  git rm -r --cached node_modules 2>$null
  Get-ChildItem -Path $root -Filter 'gongju*.json' -File -ErrorAction SilentlyContinue | ForEach-Object {
    git rm --cached -- $_.FullName 2>$null
  }

  $secrets = @(git ls-files | Select-String -Pattern 'gongju.*\.json$')
  Log ("gongju*.json paths in index: " + $secrets.Count)
  if ($secrets.Count -gt 0) { throw "Google key JSON still tracked; aborting" }

  $nm = @(git ls-files | Select-String -Pattern 'node_modules')
  Log ("node_modules paths in index: " + $nm.Count)
  if ($nm.Count -gt 0) { throw "node_modules still tracked; aborting" }

  git -c user.name="gongju-deploy" -c user.email="deploy@local" commit -m "Initial commit (exclude node_modules and secrets)"
  git branch -M main
  git remote add origin https://github.com/seongmin0402/gongju-complaint.git
  git push -u origin main --force
  Log ("push exit code: " + $LASTEXITCODE)
  if ($LASTEXITCODE -ne 0) { throw "git push failed" }
  Log 'Done.'
} catch {
  Log ("ERROR: " + $_.Exception.Message)
  exit 1
}
