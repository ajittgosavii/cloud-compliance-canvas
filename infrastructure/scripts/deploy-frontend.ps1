# ============================================================================
# Cloud Compliance Canvas - Frontend Deployment Script (Windows PowerShell)
# ============================================================================
# This script deploys the React frontend to AWS Amplify
# Run from the project root directory after deploying the backend
# ============================================================================

param(
    [string]$ApiUrl = "",
    [string]$AppName = "cloud-compliance-canvas",
    [string]$Region = "us-east-1",
    [string]$BranchName = "main"
)

# Set error handling
$ErrorActionPreference = "Stop"

# Colors for output
function Write-Status { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Step { param($msg) Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host "[!] $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Banner
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Blue
Write-Host "       Cloud Compliance Canvas - Frontend Deployment (Windows)" -ForegroundColor Blue
Write-Host "============================================================================" -ForegroundColor Blue
Write-Host ""

# Check prerequisites
Write-Step "Checking prerequisites..."

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Status "Node.js: $nodeVersion"
} catch {
    Write-Err "Node.js not found. Please install from: https://nodejs.org/"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version 2>&1
    Write-Status "npm: $npmVersion"
} catch {
    Write-Err "npm not found. Please reinstall Node.js"
    exit 1
}

# Check AWS CLI
try {
    $awsVersion = aws --version 2>&1
    Write-Status "AWS CLI: $awsVersion"
} catch {
    Write-Err "AWS CLI not found."
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path ".\package.json")) {
    Write-Err "package.json not found. Please run this script from the project root directory."
    exit 1
}

# Get API URL
if (-not $ApiUrl) {
    if (Test-Path ".\.api_url") {
        $ApiUrl = (Get-Content ".\.api_url" -Raw).Trim()
        Write-Status "API URL from file: $ApiUrl"
    } else {
        Write-Err "API URL not provided and .api_url file not found."
        Write-Host ""
        Write-Host "Usage: .\infrastructure\scripts\deploy-frontend.ps1 -ApiUrl 'https://your-api-url'" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Or run deploy-backend.ps1 first to generate the .api_url file" -ForegroundColor Gray
        exit 1
    }
}

# Install dependencies
Write-Step "Installing npm dependencies..."
npm ci 2>&1 | Out-Host

if ($LASTEXITCODE -ne 0) {
    Write-Err "npm install failed"
    exit 1
}
Write-Status "Dependencies installed"

# Create production environment file
Write-Step "Creating production environment file..."
@"
VITE_API_URL=$ApiUrl
VITE_ENABLE_DEMO_MODE=true
VITE_APP_NAME=Cloud Compliance Canvas
VITE_APP_VERSION=1.0.0
"@ | Out-File -FilePath ".\.env.production" -Encoding UTF8

Write-Status "Environment file created"

# Build
Write-Step "Building React application..."
npm run build 2>&1 | Out-Host

if ($LASTEXITCODE -ne 0) {
    Write-Err "Build failed"
    exit 1
}

if (-not (Test-Path ".\dist\index.html")) {
    Write-Err "Build output not found. Expected: .\dist\index.html"
    exit 1
}
Write-Status "Build completed successfully"

# Check/Create Amplify App
Write-Step "Configuring AWS Amplify..."

try {
    $apps = aws amplify list-apps --region $Region 2>&1 | ConvertFrom-Json
    $existingApp = $apps.apps | Where-Object { $_.name -eq $AppName }
    
    if ($existingApp) {
        $AppId = $existingApp.appId
        Write-Status "Using existing Amplify app: $AppId"
    } else {
        Write-Host "Creating new Amplify app..." -ForegroundColor Yellow
        
        $newAppJson = aws amplify create-app `
            --name $AppName `
            --description "Cloud Compliance Canvas - Enterprise AWS Governance Platform" `
            --platform WEB `
            --environment-variables "VITE_API_URL=$ApiUrl,VITE_ENABLE_DEMO_MODE=true" `
            --region $Region 2>&1
        
        $newApp = $newAppJson | ConvertFrom-Json
        $AppId = $newApp.app.appId
        Write-Status "Created new Amplify app: $AppId"
    }
} catch {
    Write-Err "Failed to configure Amplify: $_"
    exit 1
}

# Create branch if needed
Write-Step "Configuring deployment branch..."
try {
    $branchCheck = aws amplify get-branch `
        --app-id $AppId `
        --branch-name $BranchName `
        --region $Region 2>&1 | ConvertFrom-Json
    
    Write-Status "Branch '$BranchName' exists"
} catch {
    Write-Host "Creating branch '$BranchName'..." -ForegroundColor Yellow
    aws amplify create-branch `
        --app-id $AppId `
        --branch-name $BranchName `
        --stage PRODUCTION `
        --region $Region 2>&1 | Out-Null
    Write-Status "Branch created"
}

# Create zip of dist folder
Write-Step "Creating deployment package..."
$zipPath = ".\deployment.zip"
if (Test-Path $zipPath) { 
    Remove-Item $zipPath -Force 
}

try {
    Compress-Archive -Path ".\dist\*" -DestinationPath $zipPath -Force
    $zipSize = (Get-Item $zipPath).Length / 1MB
    Write-Status "Deployment package created ($('{0:N2}' -f $zipSize) MB)"
} catch {
    Write-Err "Failed to create zip file: $_"
    exit 1
}

# Create deployment
Write-Step "Creating Amplify deployment..."
try {
    $deploymentJson = aws amplify create-deployment `
        --app-id $AppId `
        --branch-name $BranchName `
        --region $Region 2>&1
    
    $deployment = $deploymentJson | ConvertFrom-Json
    $jobId = $deployment.jobId
    $uploadUrl = $deployment.zipUploadUrl
    
    Write-Status "Deployment job created: $jobId"
} catch {
    Write-Err "Failed to create deployment: $_"
    exit 1
}

# Upload zip file
Write-Step "Uploading build artifacts..."
try {
    $zipBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $zipPath))
    
    # Use .NET WebClient for upload (more reliable on Windows)
    $webClient = New-Object System.Net.WebClient
    $webClient.Headers.Add("Content-Type", "application/zip")
    $response = $webClient.UploadData($uploadUrl, "PUT", $zipBytes)
    
    Write-Status "Upload completed"
} catch {
    Write-Err "Failed to upload: $_"
    exit 1
}

# Start deployment
Write-Step "Starting deployment..."
try {
    aws amplify start-deployment `
        --app-id $AppId `
        --branch-name $BranchName `
        --job-id $jobId `
        --region $Region 2>&1 | Out-Null
    
    Write-Status "Deployment started"
} catch {
    Write-Err "Failed to start deployment: $_"
    exit 1
}

# Wait for deployment
Write-Step "Waiting for deployment to complete..."
$maxWaitTime = 300  # 5 minutes
$elapsed = 0
$pollInterval = 10

do {
    Start-Sleep -Seconds $pollInterval
    $elapsed += $pollInterval
    
    try {
        $jobJson = aws amplify get-job `
            --app-id $AppId `
            --branch-name $BranchName `
            --job-id $jobId `
            --region $Region 2>&1
        
        $job = $jobJson | ConvertFrom-Json
        $status = $job.job.summary.status
        
        Write-Host "  [$elapsed s] Status: $status" -ForegroundColor Gray
        
        if ($status -eq "SUCCEED") {
            break
        } elseif ($status -eq "FAILED" -or $status -eq "CANCELLED") {
            throw "Deployment failed with status: $status"
        }
    } catch {
        if ($_ -like "*Deployment failed*") {
            throw $_
        }
        Write-Warn "Could not get status, retrying..."
    }
    
} while ($elapsed -lt $maxWaitTime)

if ($elapsed -ge $maxWaitTime) {
    Write-Warn "Deployment is taking longer than expected. Check Amplify Console for status."
}

# Get app URL
Write-Step "Retrieving app URL..."
try {
    $appJson = aws amplify get-app --app-id $AppId --region $Region 2>&1
    $app = $appJson | ConvertFrom-Json
    $appUrl = "https://$BranchName.$($app.app.defaultDomain)"
    Write-Status "App URL retrieved"
} catch {
    Write-Warn "Could not get app URL. Check Amplify Console."
    $appUrl = "https://$BranchName.amplifyapp.com"
}

# Configure SPA routing
Write-Step "Configuring SPA routing..."
try {
    $rewriteRules = '[{"source":"</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>","target":"/index.html","status":"200"}]'
    
    aws amplify update-app `
        --app-id $AppId `
        --custom-rules $rewriteRules `
        --region $Region 2>&1 | Out-Null
    
    Write-Status "SPA routing configured"
} catch {
    Write-Warn "Could not configure routing. Please add rewrite rule manually in Amplify Console."
}

# Cleanup
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Print summary
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "                    Frontend Deployment Complete!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Application URL:" -ForegroundColor Cyan
Write-Host "  $appUrl" -ForegroundColor White
Write-Host ""
Write-Host "Backend API URL:" -ForegroundColor Cyan
Write-Host "  $ApiUrl" -ForegroundColor White
Write-Host ""
Write-Host "Amplify App ID:" -ForegroundColor Cyan
Write-Host "  $AppId" -ForegroundColor White
Write-Host ""
Write-Host "AWS Console Links:" -ForegroundColor Yellow
Write-Host "  Amplify:    https://$Region.console.aws.amazon.com/amplify/home?region=$Region#/$AppId"
Write-Host "  CloudWatch: https://$Region.console.aws.amazon.com/cloudwatch/home?region=$Region"
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Open your browser and go to:" -ForegroundColor Cyan
Write-Host "  $appUrl" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
