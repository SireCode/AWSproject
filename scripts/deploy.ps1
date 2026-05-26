# CBDFS Deploy Script (Windows PowerShell)
# Run from the dept-file-system root folder

param(
  [string]$Env = "dev",
  [string]$Region = "us-east-1",
  [string]$StackName = "cbdfs-stack"
)

$ErrorActionPreference = "Stop"

Write-Host "=== CBDFS Deploy ===" -ForegroundColor Cyan
Write-Host "Environment : $Env"
Write-Host "Region      : $Region"
Write-Host "Stack       : $StackName"
Write-Host ""

# Install backend deps
Write-Host "[1/4] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# SAM build
Write-Host "[2/4] Building SAM project..." -ForegroundColor Yellow
sam build --template infrastructure/template.yaml

# SAM deploy
Write-Host "[3/4] Deploying to AWS..." -ForegroundColor Yellow
sam deploy `
  --template-file .aws-sam/build/template.yaml `
  --stack-name $StackName `
  --region $Region `
  --capabilities CAPABILITY_IAM `
  --resolve-s3 `
  --parameter-overrides Environment=$Env

# Capture outputs
Write-Host "[4/4] Capturing stack outputs..." -ForegroundColor Yellow
$outputs = aws cloudformation describe-stacks `
  --stack-name $StackName `
  --region $Region `
  --query "Stacks[0].Outputs" `
  --output json | ConvertFrom-Json

$apiUrl = ($outputs | Where-Object { $_.OutputKey -eq "ApiUrl" }).OutputValue
$userPoolId = ($outputs | Where-Object { $_.OutputKey -eq "UserPoolId" }).OutputValue
$clientId = ($outputs | Where-Object { $_.OutputKey -eq "UserPoolClientId" }).OutputValue

Write-Host ""
Write-Host "=== Deploy Complete ===" -ForegroundColor Green
Write-Host "API URL       : $apiUrl"
Write-Host "User Pool ID  : $userPoolId"
Write-Host "Client ID     : $clientId"
Write-Host ""
Write-Host "Update frontend/src/aws-config.js with these values before building the frontend." -ForegroundColor Cyan
