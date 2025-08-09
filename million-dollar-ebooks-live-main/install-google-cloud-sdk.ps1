# Google Cloud SDK Installer Script
# This script downloads and installs the Google Cloud SDK

Write-Host "Downloading Google Cloud SDK installer..." -ForegroundColor Green
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")

Write-Host "Installing Google Cloud SDK..." -ForegroundColor Green
& $env:Temp\GoogleCloudSDKInstaller.exe

Write-Host "Installation complete! Please restart your terminal to use gcloud commands." -ForegroundColor Yellow
