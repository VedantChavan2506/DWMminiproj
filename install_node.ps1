$nodeUrl = "https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip"
$destDir = "$env:LOCALAPPDATA\Programs"
$zipPath = "$destDir\node.zip"

New-Item -ItemType Directory -Force -Path $destDir | Out-Null
Write-Host "Downloading Node.js..."
$client = New-Object System.Net.WebClient
$client.DownloadFile($nodeUrl, $zipPath)

Write-Host "Extracting Node.js..."
Expand-Archive -Path $zipPath -DestinationPath $destDir -Force

$extractedDir = "$destDir\node-v20.18.0-win-x64"
$targetDir = "$destDir\nodejs"

if (Test-Path $targetDir) {
    Remove-Item -Recurse -Force $targetDir
}
Rename-Item -Path $extractedDir -NewName "nodejs" -Force
Remove-Item -Path $zipPath -Force

Write-Host "Node.js installed successfully at $targetDir!"
& "$targetDir\node.exe" -v
& "$targetDir\npm.cmd" -v

