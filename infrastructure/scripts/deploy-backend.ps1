# ============================================================================
# Cloud Compliance Canvas - Backend Deployment Script (Windows PowerShell)
# ============================================================================
# This script deploys the FastAPI backend to AWS Lambda + API Gateway
# Run from the project root directory
# ============================================================================

param(
    [string]$StackName = "cloud-compliance-canvas-backend",
    [string]$Region = "us-east-1",
    [string]$Environment = "production"
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
Write-Host "       Cloud Compliance Canvas - Backend Deployment (Windows)" -ForegroundColor Blue
Write-Host "============================================================================" -ForegroundColor Blue
Write-Host ""

# Check prerequisites
Write-Step "Checking prerequisites..."

# Check AWS CLI
try {
    $awsVersion = aws --version 2>&1
    Write-Status "AWS CLI: $awsVersion"
} catch {
    Write-Err "AWS CLI not found. Please install from: https://awscli.amazonaws.com/AWSCLIV2.msi"
    exit 1
}

# Check SAM CLI
try {
    $samVersion = sam --version 2>&1
    Write-Status "SAM CLI: $samVersion"
} catch {
    Write-Err "SAM CLI not found. Please install from: https://github.com/aws/aws-sam-cli/releases"
    exit 1
}

# Check AWS credentials
try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Status "AWS Account: $($identity.Account)"
    Write-Status "AWS Region: $Region"
} catch {
    Write-Err "AWS credentials not configured. Run 'aws configure' first."
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path ".\infrastructure\template.yaml")) {
    Write-Err "template.yaml not found. Please run this script from the project root directory."
    Write-Host "Expected structure: react-finops-app\infrastructure\template.yaml" -ForegroundColor Gray
    exit 1
}

# Navigate to infrastructure directory
Write-Step "Building SAM application..."
Push-Location infrastructure

try {
    # Build SAM application
    sam build --use-container 2>&1 | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        # Try without container if Docker isn't available
        Write-Warn "Container build failed, trying native build..."
        sam build 2>&1
    }
    
    if ($LASTEXITCODE -ne 0) {
        throw "SAM build failed"
    }
    Write-Status "SAM build completed successfully"
} catch {
    Write-Err "SAM build failed: $_"
    Pop-Location
    exit 1
}

# Deploy
Write-Step "Deploying to AWS..."
Write-Host "Stack Name: $StackName" -ForegroundColor Gray
Write-Host "Region: $Region" -ForegroundColor Gray
Write-Host "Environment: $Environment" -ForegroundColor Gray
Write-Host ""

try {
    sam deploy `
        --stack-name $StackName `
        --region $Region `
        --capabilities CAPABILITY_IAM `
        --parameter-overrides "Environment=$Environment" "AllowedOrigins=*" `
        --no-confirm-changeset `
        --no-fail-on-empty-changeset `
        --resolve-s3
    
    if ($LASTEXITCODE -ne 0) {
        throw "SAM deploy failed"
    }
    Write-Status "Deployment completed successfully"
} catch {
    Write-Err "SAM deploy failed: $_"
    Pop-Location
    exit 1
}

# Get outputs
Write-Step "Retrieving deployment outputs..."

try {
    $outputs = aws cloudformation describe-stacks `
        --stack-name $StackName `
        --query "Stacks[0].Outputs" `
        --region $Region 2>&1 | ConvertFrom-Json
    
    $apiUrl = ($outputs | Where-Object { $_.OutputKey -eq "ApiUrl" }).OutputValue
    $functionArn = ($outputs | Where-Object { $_.OutputKey -eq "FunctionArn" }).OutputValue
    
    if (-not $apiUrl) {
        throw "Could not retrieve API URL from stack outputs"
    }
} catch {
    Write-Err "Failed to get stack outputs: $_"
    Pop-Location
    exit 1
}

# Go back to root
Pop-Location

# Save API URL to file
$apiUrl | Out-File -FilePath ".\.api_url" -Encoding UTF8 -NoNewline

# Test the API
Write-Step "Testing API endpoint..."
try {
    $healthCheck = Invoke-RestMethod -Uri "$apiUrl/api/health" -TimeoutSec 10
    if ($healthCheck.status -eq "healthy") {
        Write-Status "API health check passed"
    } else {
        Write-Warn "API responded but status is: $($healthCheck.status)"
    }
} catch {
    Write-Warn "Could not reach API (this is normal for first deployment, try again in 30 seconds)"
}

# Print summary
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "                    Backend Deployment Complete!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "API Gateway URL:" -ForegroundColor Cyan
Write-Host "  $apiUrl" -ForegroundColor White
Write-Host ""
Write-Host "Lambda Function:" -ForegroundColor Cyan
Write-Host "  $functionArn" -ForegroundColor White
Write-Host ""
Write-Host "Test Commands:" -ForegroundColor Yellow
Write-Host "  Invoke-RestMethod -Uri '$apiUrl/api/health'"
Write-Host "  Invoke-RestMethod -Uri '$apiUrl/api/dashboard'"
Write-Host ""
Write-Host "API URL saved to: .\.api_url" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Step: Run .\infrastructure\scripts\deploy-frontend.ps1" -ForegroundColor Cyan
