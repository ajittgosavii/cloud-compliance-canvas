# Cloud Compliance Canvas - Full Deployment Script (Windows)
# Run from project root: .\deploy-all.ps1

param(
    [string]$Region = "us-east-1",
    [string]$Environment = "production",
    [string]$StackName = "cloud-compliance-canvas"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  CLOUD COMPLIANCE CANVAS - AWS DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Region:      $Region" -ForegroundColor Gray
Write-Host "  Environment: $Environment" -ForegroundColor Gray
Write-Host ""

# Check prerequisites
Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

try {
    $null = aws --version
    Write-Host "  [OK] AWS CLI found" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] AWS CLI not found. Install from: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Red
    exit 1
}

try {
    $null = sam --version
    Write-Host "  [OK] SAM CLI found" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] SAM CLI not found. Install from: https://github.com/aws/aws-sam-cli/releases" -ForegroundColor Red
    exit 1
}

try {
    $null = node --version
    Write-Host "  [OK] Node.js found" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Node.js not found. Install from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

try {
    $identity = aws sts get-caller-identity | ConvertFrom-Json
    Write-Host "  [OK] AWS Account: $($identity.Account)" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] AWS credentials not configured. Run: aws configure" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".\infrastructure\template.yaml")) {
    Write-Host "  [ERROR] Not in project root. Please cd to react-finops-app folder" -ForegroundColor Red
    exit 1
}

# Deploy Backend
Write-Host ""
Write-Host "[2/6] Building backend (SAM)..." -ForegroundColor Yellow
Push-Location infrastructure

sam build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] SAM build failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "  [OK] Build completed" -ForegroundColor Green

Write-Host ""
Write-Host "[3/6] Deploying backend to AWS (3-5 minutes)..." -ForegroundColor Yellow

sam deploy --stack-name "$StackName-backend" --region $Region --capabilities CAPABILITY_IAM --parameter-overrides "Environment=$Environment" "AllowedOrigins=*" --no-confirm-changeset --no-fail-on-empty-changeset --resolve-s3

if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] SAM deploy failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "  [OK] Backend deployed" -ForegroundColor Green

# Get API URL
$stackOutputs = aws cloudformation describe-stacks --stack-name "$StackName-backend" --query "Stacks[0].Outputs" --region $Region | ConvertFrom-Json
$ApiUrl = ($stackOutputs | Where-Object { $_.OutputKey -eq "ApiUrl" }).OutputValue

Pop-Location

Write-Host "  API URL: $ApiUrl" -ForegroundColor Cyan
$ApiUrl | Out-File -FilePath ".\.api_url" -Encoding ASCII

# Build Frontend
Write-Host ""
Write-Host "[4/6] Installing npm dependencies..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] Dependencies installed" -ForegroundColor Green

# Create env file
$envContent = "VITE_API_URL=$ApiUrl`nVITE_ENABLE_DEMO_MODE=true`nVITE_APP_NAME=Cloud Compliance Canvas"
$envContent | Out-File -FilePath ".\.env.production" -Encoding ASCII

Write-Host ""
Write-Host "[5/6] Building React application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] Frontend built" -ForegroundColor Green

# Deploy to Amplify
Write-Host ""
Write-Host "[6/6] Deploying to AWS Amplify..." -ForegroundColor Yellow

# Check if app exists
$appsJson = aws amplify list-apps --region $Region
$apps = $appsJson | ConvertFrom-Json
$existingApp = $apps.apps | Where-Object { $_.name -eq $StackName }

if ($existingApp) {
    $AppId = $existingApp.appId
    Write-Host "  Using existing app: $AppId" -ForegroundColor Gray
} else {
    Write-Host "  Creating new Amplify app..." -ForegroundColor Gray
    $newAppJson = aws amplify create-app --name $StackName --platform WEB --region $Region
    $newApp = $newAppJson | ConvertFrom-Json
    $AppId = $newApp.app.appId
    Write-Host "  Created app: $AppId" -ForegroundColor Green
}

# Create branch
try {
    $null = aws amplify get-branch --app-id $AppId --branch-name main --region $Region 2>$null
} catch {
    aws amplify create-branch --app-id $AppId --branch-name main --stage PRODUCTION --region $Region | Out-Null
}

# Create zip
Write-Host "  Creating deployment package..." -ForegroundColor Gray
if (Test-Path ".\deployment.zip") { Remove-Item ".\deployment.zip" -Force }
Compress-Archive -Path ".\dist\*" -DestinationPath ".\deployment.zip" -Force

# Upload
Write-Host "  Uploading to Amplify..." -ForegroundColor Gray
$deployJson = aws amplify create-deployment --app-id $AppId --branch-name main --region $Region
$deploy = $deployJson | ConvertFrom-Json
$jobId = $deploy.jobId
$uploadUrl = $deploy.zipUploadUrl

$zipContent = [System.IO.File]::ReadAllBytes((Resolve-Path ".\deployment.zip"))
$webClient = New-Object System.Net.WebClient
$webClient.Headers.Add("Content-Type", "application/zip")
$null = $webClient.UploadData($uploadUrl, "PUT", $zipContent)

# Start deployment
aws amplify start-deployment --app-id $AppId --branch-name main --job-id $jobId --region $Region | Out-Null

Write-Host "  Waiting for deployment..." -ForegroundColor Gray
$maxWait = 300
$elapsed = 0

do {
    Start-Sleep -Seconds 10
    $elapsed = $elapsed + 10
    $jobJson = aws amplify get-job --app-id $AppId --branch-name main --job-id $jobId --region $Region
    $job = $jobJson | ConvertFrom-Json
    $status = $job.job.summary.status
    Write-Host "    [$elapsed sec] $status" -ForegroundColor Gray
} while (($status -eq "PENDING" -or $status -eq "RUNNING") -and $elapsed -lt $maxWait)

# Get URL
$appJson = aws amplify get-app --app-id $AppId --region $Region
$appInfo = $appJson | ConvertFrom-Json
$AppUrl = "https://main." + $appInfo.app.defaultDomain

# Configure SPA routing
$rules = "[{`"source`":`"</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`",`"target`":`"/index.html`",`"status`":`"200`"}]"
aws amplify update-app --app-id $AppId --custom-rules $rules --region $Region | Out-Null

# Cleanup
Remove-Item ".\deployment.zip" -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend URL: $AppUrl" -ForegroundColor Cyan
Write-Host "  Backend API:  $ApiUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Open in browser: Start-Process $AppUrl" -ForegroundColor Gray
Write-Host ""

$openIt = Read-Host "  Open in browser now? (Y/n)"
if ($openIt -ne "n") {
    Start-Process $AppUrl
}
