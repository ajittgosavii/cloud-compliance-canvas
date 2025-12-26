# Cloud Compliance Canvas - Windows Deployment Guide

## Complete Step-by-Step Guide for Windows PC

---

## 📋 Table of Contents

1. [Prerequisites Setup (Windows)](#1-prerequisites-setup-windows)
2. [Quick Deployment (20 minutes)](#2-quick-deployment-20-minutes)
3. [Step-by-Step Manual Deployment](#3-step-by-step-manual-deployment)
4. [Azure AD SSO Configuration](#4-azure-ad-sso-configuration)
5. [Troubleshooting Windows Issues](#5-troubleshooting-windows-issues)

---

## 1. Prerequisites Setup (Windows)

### 1.1 Install AWS CLI v2

**Option A: MSI Installer (Recommended)**

1. Download the installer:
   ```
   https://awscli.amazonaws.com/AWSCLIV2.msi
   ```

2. Run the MSI installer and follow the prompts

3. **Restart PowerShell/Command Prompt**

4. Verify installation:
   ```powershell
   aws --version
   # Expected: aws-cli/2.x.x Python/3.x.x Windows/10 exe/AMD64
   ```

**Option B: Using winget**
```powershell
winget install Amazon.AWSCLI
```

### 1.2 Configure AWS Credentials

Open PowerShell and run:

```powershell
aws configure
```

Enter your credentials:
```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]: json
```

Verify configuration:
```powershell
aws sts get-caller-identity
```

Expected output:
```json
{
    "UserId": "AIDAXXXXXXXXXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-username"
}
```

### 1.3 Install AWS SAM CLI

**Option A: MSI Installer (Recommended)**

1. Download:
   ```
   https://github.com/aws/aws-sam-cli/releases/latest/download/AWS_SAM_CLI_64_PY3.msi
   ```

2. Run the installer

3. **Restart PowerShell**

4. Verify:
   ```powershell
   sam --version
   # Expected: SAM CLI, version 1.x.x
   ```

**Option B: Using pip**
```powershell
pip install aws-sam-cli
```

### 1.4 Install Node.js

**Option A: Direct Download (Recommended)**

1. Download Node.js 18 LTS:
   ```
   https://nodejs.org/dist/v18.19.0/node-v18.19.0-x64.msi
   ```

2. Run the installer (check "Automatically install necessary tools")

3. **Restart PowerShell**

4. Verify:
   ```powershell
   node --version
   # Expected: v18.x.x
   
   npm --version
   # Expected: 10.x.x
   ```

**Option B: Using winget**
```powershell
winget install OpenJS.NodeJS.LTS
```

### 1.5 Install Git for Windows

1. Download:
   ```
   https://git-scm.com/download/win
   ```

2. Run installer with default options

3. Verify:
   ```powershell
   git --version
   ```

### 1.6 Install 7-Zip or use Windows built-in

For extracting zip files, Windows 10/11 has built-in support. Just right-click → Extract All.

---

## 2. Quick Deployment (20 minutes)

### Step 2.1: Extract the Project

1. **Download** `react-finops-app-complete.zip`

2. **Right-click** → **Extract All** → Choose location (e.g., `C:\Projects\`)

3. **Open PowerShell as Administrator**:
   - Press `Win + X` → Select "Windows PowerShell (Admin)"
   - Or search "PowerShell" → Right-click → Run as Administrator

4. **Navigate to project**:
   ```powershell
   cd C:\Projects\react-finops-app
   ```

### Step 2.2: Deploy Backend (Lambda + API Gateway)

```powershell
# Navigate to infrastructure folder
cd infrastructure

# Build the SAM application
sam build

# Deploy (first time will prompt for settings)
sam deploy --guided
```

When prompted, enter:
```
Stack Name [sam-app]: cloud-compliance-canvas-backend
AWS Region [us-east-1]: us-east-1
Confirm changes before deploy [y/N]: y
Allow SAM CLI IAM role creation [Y/n]: Y
Disable rollback [y/N]: N
Save arguments to configuration file [Y/n]: Y
SAM configuration file [samconfig.toml]: samconfig.toml
SAM configuration environment [default]: default
```

**Wait 3-5 minutes for deployment...**

After completion, note the outputs:
```
CloudFormation outputs from deployed stack
---------------------------------------------------------------------------
Outputs
---------------------------------------------------------------------------
Key                 ApiUrl
Description         API Gateway endpoint URL
Value               https://abc123xyz.execute-api.us-east-1.amazonaws.com/production
---------------------------------------------------------------------------
```

**⚠️ SAVE THIS API URL - You'll need it for the frontend!**

### Step 2.3: Test the Backend API

```powershell
# Test health endpoint (replace with your API URL)
Invoke-RestMethod -Uri "https://YOUR-API-URL/api/health"
```

Expected response:
```
status    : healthy
version   : 1.0.0
timestamp : 2025-12-26T...
services  : @{api=operational; database=operational; ...}
```

### Step 2.4: Build the Frontend

```powershell
# Go back to project root
cd ..

# Install npm dependencies
npm ci

# Create production environment file
@"
VITE_API_URL=https://YOUR-API-URL-HERE/production
VITE_ENABLE_DEMO_MODE=true
VITE_APP_NAME=Cloud Compliance Canvas
"@ | Out-File -FilePath .env.production -Encoding UTF8

# Build for production
npm run build
```

### Step 2.5: Deploy Frontend to Amplify (Console Method)

1. **Open AWS Amplify Console**:
   ```
   https://console.aws.amazon.com/amplify/home
   ```

2. **Click "Create new app"**

3. **Select "Deploy without Git provider"** (for manual deployment)

4. **App name**: `cloud-compliance-canvas`

5. **Environment**: `production`

6. **Drag and drop** the `dist` folder from your project
   - Location: `C:\Projects\react-finops-app\dist`

7. **Click "Save and deploy"**

8. **Wait 2-3 minutes** for deployment

9. **Get your app URL**:
   ```
   https://main.d1234abcd.amplifyapp.com
   ```

### Step 2.6: Configure Environment Variables in Amplify

1. In Amplify Console → Your App → **Hosting** → **Environment variables**

2. Click **Manage variables**

3. Add these variables:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://YOUR-API-URL.execute-api.us-east-1.amazonaws.com/production` |
   | `VITE_ENABLE_DEMO_MODE` | `true` |
   | `VITE_APP_NAME` | `Cloud Compliance Canvas` |

4. Click **Save**

5. **Redeploy** (drag and drop `dist` folder again)

### Step 2.7: Configure SPA Routing

1. In Amplify Console → Your App → **Hosting** → **Rewrites and redirects**

2. Click **Edit**

3. Add this rule:

   | Source address | Target address | Type |
   |----------------|----------------|------|
   | `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|js\|png\|txt\|svg\|woff\|woff2\|ttf\|map\|json)$)([^.]+$)/>` | `/index.html` | `200 (Rewrite)` |

4. Click **Save**

### 🎉 Done! Access Your Application

Open your browser and go to:
```
https://main.XXXXX.amplifyapp.com
```

---

## 3. Step-by-Step Manual Deployment

### 3.1 Deploy Backend with PowerShell Script

Create a deployment script:

```powershell
# Save as deploy-backend.ps1

# Configuration
$StackName = "cloud-compliance-canvas-backend"
$Region = "us-east-1"
$Environment = "production"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploying Cloud Compliance Canvas API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

# Check AWS CLI
try {
    $awsVersion = aws --version
    Write-Host "[OK] AWS CLI: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] AWS CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Check SAM CLI
try {
    $samVersion = sam --version
    Write-Host "[OK] SAM CLI: $samVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] SAM CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Check AWS credentials
try {
    $identity = aws sts get-caller-identity | ConvertFrom-Json
    Write-Host "[OK] AWS Account: $($identity.Account)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] AWS credentials not configured. Run 'aws configure' first." -ForegroundColor Red
    exit 1
}

# Navigate to infrastructure directory
Set-Location infrastructure

# Build SAM application
Write-Host "`nBuilding SAM application..." -ForegroundColor Yellow
sam build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] SAM build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] SAM build completed" -ForegroundColor Green

# Deploy SAM application
Write-Host "`nDeploying to AWS..." -ForegroundColor Yellow
sam deploy `
    --stack-name $StackName `
    --region $Region `
    --capabilities CAPABILITY_IAM `
    --parameter-overrides "Environment=$Environment AllowedOrigins=*" `
    --no-confirm-changeset `
    --no-fail-on-empty-changeset

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] SAM deploy failed!" -ForegroundColor Red
    exit 1
}

# Get API URL
Write-Host "`nGetting API URL..." -ForegroundColor Yellow
$outputs = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --query "Stacks[0].Outputs" `
    --region $Region | ConvertFrom-Json

$apiUrl = ($outputs | Where-Object { $_.OutputKey -eq "ApiUrl" }).OutputValue

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nAPI URL: $apiUrl" -ForegroundColor Cyan

# Save API URL to file
$apiUrl | Out-File -FilePath "../.api_url" -Encoding UTF8
Write-Host "API URL saved to .api_url file" -ForegroundColor Gray

# Go back to root
Set-Location ..
```

Run it:
```powershell
.\deploy-backend.ps1
```

### 3.2 Deploy Frontend with PowerShell Script

Create frontend deployment script:

```powershell
# Save as deploy-frontend.ps1

param(
    [string]$ApiUrl = "",
    [string]$AppName = "cloud-compliance-canvas"
)

# Configuration
$Region = "us-east-1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploying Cloud Compliance Canvas UI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Get API URL from file if not provided
if (-not $ApiUrl) {
    if (Test-Path ".api_url") {
        $ApiUrl = Get-Content ".api_url" -Raw
        $ApiUrl = $ApiUrl.Trim()
        Write-Host "Using API URL from file: $ApiUrl" -ForegroundColor Gray
    } else {
        Write-Host "[ERROR] API URL not provided and .api_url file not found." -ForegroundColor Red
        Write-Host "Usage: .\deploy-frontend.ps1 -ApiUrl 'https://your-api-url'" -ForegroundColor Yellow
        exit 1
    }
}

# Install dependencies
Write-Host "`nInstalling npm dependencies..." -ForegroundColor Yellow
npm ci

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] npm install failed!" -ForegroundColor Red
    exit 1
}

# Create environment file
Write-Host "Creating production environment file..." -ForegroundColor Yellow
@"
VITE_API_URL=$ApiUrl
VITE_ENABLE_DEMO_MODE=true
VITE_APP_NAME=Cloud Compliance Canvas
"@ | Out-File -FilePath ".env.production" -Encoding UTF8

# Build
Write-Host "`nBuilding React application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Build completed" -ForegroundColor Green

# Check if Amplify app exists
Write-Host "`nChecking Amplify app..." -ForegroundColor Yellow
$apps = aws amplify list-apps --region $Region | ConvertFrom-Json
$existingApp = $apps.apps | Where-Object { $_.name -eq $AppName }

if ($existingApp) {
    $AppId = $existingApp.appId
    Write-Host "Using existing Amplify app: $AppId" -ForegroundColor Gray
} else {
    Write-Host "Creating new Amplify app..." -ForegroundColor Yellow
    $newApp = aws amplify create-app `
        --name $AppName `
        --description "Cloud Compliance Canvas - Enterprise AWS Governance Platform" `
        --platform WEB `
        --region $Region | ConvertFrom-Json
    
    $AppId = $newApp.app.appId
    Write-Host "Created Amplify app: $AppId" -ForegroundColor Green
}

# Create branch if doesn't exist
try {
    aws amplify create-branch `
        --app-id $AppId `
        --branch-name main `
        --stage PRODUCTION `
        --region $Region 2>$null
} catch {
    # Branch already exists, ignore
}

# Create zip of dist folder
Write-Host "`nCreating deployment package..." -ForegroundColor Yellow
$zipPath = ".\deployment.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath }
Compress-Archive -Path ".\dist\*" -DestinationPath $zipPath

# Create deployment
Write-Host "Creating Amplify deployment..." -ForegroundColor Yellow
$deployment = aws amplify create-deployment `
    --app-id $AppId `
    --branch-name main `
    --region $Region | ConvertFrom-Json

$jobId = $deployment.jobId
$uploadUrl = $deployment.zipUploadUrl

# Upload zip using Invoke-RestMethod
Write-Host "Uploading build artifacts..." -ForegroundColor Yellow
$zipBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $zipPath))
Invoke-RestMethod -Uri $uploadUrl -Method PUT -Body $zipBytes -ContentType "application/zip"

# Start deployment
Write-Host "Starting deployment..." -ForegroundColor Yellow
aws amplify start-deployment `
    --app-id $AppId `
    --branch-name main `
    --job-id $jobId `
    --region $Region | Out-Null

# Wait for deployment
Write-Host "Waiting for deployment to complete..." -ForegroundColor Yellow
do {
    Start-Sleep -Seconds 5
    $job = aws amplify get-job `
        --app-id $AppId `
        --branch-name main `
        --job-id $jobId `
        --region $Region | ConvertFrom-Json
    
    $status = $job.job.summary.status
    Write-Host "  Status: $status" -ForegroundColor Gray
} while ($status -eq "PENDING" -or $status -eq "RUNNING")

if ($status -eq "SUCCEED") {
    # Get app URL
    $app = aws amplify get-app --app-id $AppId --region $Region | ConvertFrom-Json
    $appUrl = "https://main." + $app.app.defaultDomain
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  Frontend Deployment Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`nApp URL: $appUrl" -ForegroundColor Cyan
    
    # Cleanup
    Remove-Item $zipPath -ErrorAction SilentlyContinue
} else {
    Write-Host "[ERROR] Deployment failed with status: $status" -ForegroundColor Red
    exit 1
}
```

Run it:
```powershell
.\deploy-frontend.ps1
```

---

## 4. Azure AD SSO Configuration

### 4.1 Create Azure AD App Registration

1. **Go to Azure Portal**: https://portal.azure.com

2. **Navigate to**: Azure Active Directory → App registrations → New registration

3. **Configure**:
   - **Name**: `Cloud Compliance Canvas`
   - **Supported account types**: Single tenant
   - **Redirect URI**: 
     - Platform: `Web`
     - URL: `https://YOUR-AMPLIFY-URL.amplifyapp.com/callback`

4. **Click "Register"**

5. **Copy these values** (you'll need them):
   - Application (client) ID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - Directory (tenant) ID: `yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy`

### 4.2 Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: `Cloud Compliance Canvas`
4. Expires: `24 months`
5. Click **Add**
6. **IMMEDIATELY COPY THE VALUE** (you can't see it again!)

### 4.3 Configure AWS Cognito (PowerShell)

```powershell
# Set your values
$UserPoolName = "cloud-compliance-canvas-users"
$AzureClientId = "your-azure-client-id"
$AzureClientSecret = "your-azure-client-secret"
$AzureTenantId = "your-azure-tenant-id"
$AmplifyUrl = "https://main.xxxxx.amplifyapp.com"
$Region = "us-east-1"

# Create User Pool
Write-Host "Creating Cognito User Pool..." -ForegroundColor Yellow
$userPool = aws cognito-idp create-user-pool `
    --pool-name $UserPoolName `
    --policies '{"PasswordPolicy":{"MinimumLength":8,"RequireUppercase":true,"RequireLowercase":true,"RequireNumbers":true,"RequireSymbols":false}}' `
    --auto-verified-attributes email `
    --username-attributes email `
    --region $Region | ConvertFrom-Json

$UserPoolId = $userPool.UserPool.Id
Write-Host "User Pool ID: $UserPoolId" -ForegroundColor Green

# Create User Pool Domain
$accountId = (aws sts get-caller-identity | ConvertFrom-Json).Account
$domain = "cloud-compliance-canvas-$accountId"

aws cognito-idp create-user-pool-domain `
    --user-pool-id $UserPoolId `
    --domain $domain `
    --region $Region

Write-Host "Cognito Domain: $domain.auth.$Region.amazoncognito.com" -ForegroundColor Green

# Add Azure AD as Identity Provider
Write-Host "Adding Azure AD Identity Provider..." -ForegroundColor Yellow

$providerDetails = @{
    client_id = $AzureClientId
    client_secret = $AzureClientSecret
    authorize_scopes = "openid profile email"
    oidc_issuer = "https://login.microsoftonline.com/$AzureTenantId/v2.0"
    attributes_request_method = "GET"
} | ConvertTo-Json -Compress

$attributeMapping = @{
    email = "email"
    name = "name"
    username = "sub"
} | ConvertTo-Json -Compress

aws cognito-idp create-identity-provider `
    --user-pool-id $UserPoolId `
    --provider-name AzureAD `
    --provider-type OIDC `
    --provider-details $providerDetails `
    --attribute-mapping $attributeMapping `
    --region $Region

Write-Host "Azure AD Identity Provider added" -ForegroundColor Green

# Create App Client
Write-Host "Creating App Client..." -ForegroundColor Yellow

$callbackUrls = @($AmplifyUrl, "$AmplifyUrl/callback", "http://localhost:5173", "http://localhost:5173/callback") | ConvertTo-Json -Compress
$logoutUrls = @($AmplifyUrl, "http://localhost:5173") | ConvertTo-Json -Compress

$client = aws cognito-idp create-user-pool-client `
    --user-pool-id $UserPoolId `
    --client-name "cloud-compliance-canvas-client" `
    --no-generate-secret `
    --supported-identity-providers COGNITO AzureAD `
    --callback-urls $callbackUrls `
    --logout-urls $logoutUrls `
    --allowed-o-auth-flows code implicit `
    --allowed-o-auth-scopes email openid profile `
    --allowed-o-auth-flows-user-pool-client `
    --region $Region | ConvertFrom-Json

$ClientId = $client.UserPoolClient.ClientId
Write-Host "Client ID: $ClientId" -ForegroundColor Green

# Output summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Azure AD SSO Configuration Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nAdd these to Amplify Environment Variables:" -ForegroundColor Yellow
Write-Host "VITE_COGNITO_USER_POOL_ID = $UserPoolId"
Write-Host "VITE_COGNITO_CLIENT_ID = $ClientId"
Write-Host "VITE_COGNITO_DOMAIN = $domain.auth.$Region.amazoncognito.com"
Write-Host "VITE_AZURE_CLIENT_ID = $AzureClientId"
Write-Host "VITE_AZURE_TENANT_ID = $AzureTenantId"
```

### 4.4 Update Azure AD Redirect URIs

Add to Azure AD App Registration → Authentication → Add URI:
- `https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`

---

## 5. Troubleshooting Windows Issues

### Issue: "sam" is not recognized

**Solution**:
```powershell
# Check if SAM is in PATH
$env:Path -split ';' | Where-Object { $_ -like '*SAM*' }

# If not, add it manually (adjust path as needed)
$env:Path += ";C:\Program Files\Amazon\AWSSAMCLI\bin"

# Or reinstall SAM CLI using MSI
```

### Issue: "npm" is not recognized

**Solution**:
```powershell
# Restart PowerShell after installing Node.js
# Or add to PATH manually:
$env:Path += ";C:\Program Files\nodejs"
```

### Issue: PowerShell Execution Policy

**Solution**:
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: SSL/TLS Errors

**Solution**:
```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
```

### Issue: AWS Credentials Not Found

**Solution**:
```powershell
# Check credentials file exists
Test-Path "$env:USERPROFILE\.aws\credentials"

# Reconfigure if needed
aws configure

# Or set environment variables
$env:AWS_ACCESS_KEY_ID = "your-access-key"
$env:AWS_SECRET_ACCESS_KEY = "your-secret-key"
$env:AWS_DEFAULT_REGION = "us-east-1"
```

### Issue: SAM Build Fails with Python Errors

**Solution**:
```powershell
# Install Python 3.11
winget install Python.Python.3.11

# Verify
python --version

# Restart PowerShell
```

### Issue: Long Path Names (Windows)

**Solution**:
```powershell
# Enable long paths (requires admin)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
    -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

### Issue: Zip File Creation Fails

**Solution**:
```powershell
# Use PowerShell 5.0+ built-in command
Compress-Archive -Path ".\dist\*" -DestinationPath ".\deployment.zip" -Force

# Or install 7-Zip and use:
& "C:\Program Files\7-Zip\7z.exe" a -tzip deployment.zip .\dist\*
```

---

## 📋 Quick Reference Commands (Windows PowerShell)

```powershell
# Check AWS identity
aws sts get-caller-identity

# List CloudFormation stacks
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE

# View Lambda logs
aws logs tail /aws/lambda/cloud-compliance-canvas-api-production --follow

# Get API URL
aws cloudformation describe-stacks `
    --stack-name cloud-compliance-canvas-backend `
    --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" `
    --output text

# Test API
Invoke-RestMethod -Uri "https://YOUR-API-URL/api/health"

# Delete all resources (cleanup)
aws cloudformation delete-stack --stack-name cloud-compliance-canvas-backend
aws amplify delete-app --app-id YOUR_APP_ID

# Build and deploy backend
cd infrastructure
sam build
sam deploy

# Build frontend
cd ..
npm ci
npm run build
```

---

## ✅ Windows Deployment Checklist

- [ ] Install AWS CLI v2 (MSI installer)
- [ ] Install AWS SAM CLI (MSI installer)
- [ ] Install Node.js 18 LTS (MSI installer)
- [ ] Install Git for Windows
- [ ] Configure AWS credentials (`aws configure`)
- [ ] Extract `react-finops-app-complete.zip`
- [ ] Deploy backend: `cd infrastructure; sam build; sam deploy --guided`
- [ ] Note the API URL from outputs
- [ ] Install npm packages: `npm ci`
- [ ] Build frontend: `npm run build`
- [ ] Create Amplify app in AWS Console
- [ ] Upload `dist` folder to Amplify
- [ ] Add environment variables in Amplify
- [ ] Configure SPA routing (rewrite rules)
- [ ] Test the application
- [ ] (Optional) Configure Azure AD SSO

---

## 🎉 Success!

Your Cloud Compliance Canvas is now deployed from Windows!

| Component | Status |
|-----------|--------|
| Backend API | ✅ Lambda + API Gateway |
| Frontend | ✅ AWS Amplify |
| Demo Mode | ✅ Works immediately |
| All 10 Pages | ✅ Functional |

Open your Amplify URL in your browser and start using the platform!

---

*Windows Deployment Guide v1.0 | December 2025*
