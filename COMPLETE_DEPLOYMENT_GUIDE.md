# Cloud Compliance Canvas - Complete AWS Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start (15 minutes)](#2-quick-start-15-minutes)
3. [Step-by-Step Manual Deployment](#3-step-by-step-manual-deployment)
   - [3.1 Deploy Backend API (Lambda)](#31-deploy-backend-api-lambda)
   - [3.2 Deploy Frontend (Amplify)](#32-deploy-frontend-amplify)
4. [Azure AD SSO Configuration](#4-azure-ad-sso-configuration)
5. [Custom Domain Setup](#5-custom-domain-setup)
6. [Post-Deployment Configuration](#6-post-deployment-configuration)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisites

### Required Tools

```bash
# 1. Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify
aws --version

# 2. Configure AWS credentials
aws configure
# Enter:
#   AWS Access Key ID: <your-access-key>
#   AWS Secret Access Key: <your-secret-key>
#   Default region: us-east-1
#   Default output format: json

# 3. Install AWS SAM CLI
pip install aws-sam-cli

# Verify
sam --version

# 4. Install Node.js 18+ (if not installed)
# Using nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Verify
node --version  # Should be v18.x.x or higher

# 5. Install Git
sudo apt-get install git  # Ubuntu/Debian
# or
brew install git  # macOS
```

### Required AWS Permissions

Your IAM user/role needs these permissions:
- `AWSLambdaFullAccess`
- `AmazonAPIGatewayAdministrator`
- `AWSCloudFormationFullAccess`
- `IAMFullAccess`
- `AmplifyFullAccess`
- `AmazonCognitoPowerUser`

Or use `AdministratorAccess` for simplicity.

### Verify AWS Access

```bash
# Verify your identity
aws sts get-caller-identity

# Expected output:
# {
#     "UserId": "AIDAXXXXXXXXXXXXXXXXX",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/your-username"
# }
```

---

## 2. Quick Start (15 minutes)

For the fastest deployment, use this automated approach:

### Step 1: Extract and Navigate

```bash
# Extract the zip file
unzip react-finops-app-amplify-ready.zip
cd react-finops-app
```

### Step 2: Run Automated Deployment

```bash
# Make script executable
chmod +x infrastructure/scripts/deploy.sh

# Set environment variables
export AWS_REGION=us-east-1
export PROJECT_NAME=cloud-compliance-canvas
export ENVIRONMENT=production

# Run deployment
./infrastructure/scripts/deploy.sh
```

### Step 3: Access Your Application

After ~10-15 minutes, you'll see:
```
============================================================================
                    Deployment Complete!
============================================================================

Frontend URL:  https://main.d1234abcdef.amplifyapp.com
Backend API:   https://abc123xyz.execute-api.us-east-1.amazonaws.com/production
```

**Done!** Open the Frontend URL in your browser.

---

## 3. Step-by-Step Manual Deployment

If you prefer manual control, follow these steps:

### 3.1 Deploy Backend API (Lambda)

#### Step 3.1.1: Navigate to Infrastructure Directory

```bash
cd react-finops-app/infrastructure
```

#### Step 3.1.2: Build the SAM Application

```bash
sam build --template-file template.yaml
```

Expected output:
```
Building codeuri: lambda/ runtime: python3.11
 Running PythonPipBuilder:ResolveDependencies
 Running PythonPipBuilder:CopySource
Build Succeeded
```

#### Step 3.1.3: Deploy to AWS

```bash
sam deploy \
  --stack-name cloud-compliance-canvas-backend \
  --region us-east-1 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Environment=production \
    AllowedOrigins="*" \
  --resolve-s3
```

First deployment will prompt for confirmation. Press `y` to proceed.

#### Step 3.1.4: Note the API URL

```bash
# Get the API URL from stack outputs
aws cloudformation describe-stacks \
  --stack-name cloud-compliance-canvas-backend \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text

# Example output: https://abc123xyz.execute-api.us-east-1.amazonaws.com/production
```

**Save this URL** - you'll need it for the frontend configuration.

#### Step 3.1.5: Test the API

```bash
# Test health endpoint
curl https://YOUR-API-URL/api/health

# Expected response:
# {"status":"healthy","version":"1.0.0","timestamp":"2025-12-26T..."}
```

---

### 3.2 Deploy Frontend (Amplify)

#### Step 3.2.1: Go Back to Project Root

```bash
cd ..  # Back to react-finops-app directory
```

#### Step 3.2.2: Create Environment File

```bash
cat > .env.production << EOF
VITE_API_URL=https://YOUR-API-URL-FROM-STEP-3.1.4
VITE_ENABLE_DEMO_MODE=true
VITE_APP_NAME=Cloud Compliance Canvas
EOF
```

Replace `YOUR-API-URL-FROM-STEP-3.1.4` with your actual API URL.

#### Step 3.2.3: Install Dependencies and Build

```bash
# Install npm packages
npm ci

# Build for production
npm run build
```

#### Step 3.2.4: Create Amplify App via AWS Console

1. **Open AWS Amplify Console**
   ```
   https://console.aws.amazon.com/amplify/
   ```

2. **Click "Create new app"**

3. **Choose deployment method:**
   - Select **"Deploy without Git provider"** (for manual deployment)
   - OR select **GitHub** (for CI/CD - recommended)

#### Option A: Manual Deployment (No Git)

4. **Click "Deploy without Git provider"**

5. **App name:** `cloud-compliance-canvas`

6. **Environment:** `production`

7. **Method:** Drag and drop

8. **Upload:** Drag the `dist` folder OR create a zip:
   ```bash
   cd dist
   zip -r ../amplify-deploy.zip .
   cd ..
   # Then upload amplify-deploy.zip
   ```

9. **Click "Save and deploy"**

#### Option B: GitHub Deployment (Recommended for CI/CD)

4. **Initialize Git and push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Cloud Compliance Canvas"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/cloud-compliance-canvas.git
   git push -u origin main
   ```

5. **In Amplify Console:**
   - Select **GitHub**
   - **Authorize** AWS Amplify
   - Select your repository: `cloud-compliance-canvas`
   - Select branch: `main`

6. **Build Settings:** Amplify auto-detects `amplify.yml`

7. **Environment Variables:** Click "Advanced settings" and add:
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | Your API URL from Step 3.1.4 |
   | `VITE_ENABLE_DEMO_MODE` | `true` |
   | `VITE_APP_NAME` | `Cloud Compliance Canvas` |

8. **Click "Save and deploy"**

#### Step 3.2.5: Wait for Deployment

- Build typically takes 3-5 minutes
- Watch the progress in Amplify Console
- Status will change: Provision → Build → Deploy → Verify

#### Step 3.2.6: Get Your App URL

Once complete, you'll see:
```
✓ Deployment successfully completed

https://main.d1234abcdef.amplifyapp.com
```

#### Step 3.2.7: Configure SPA Routing

Add rewrite rule for React Router:

1. Go to **Amplify Console** → Your App → **Rewrites and redirects**
2. Click **Edit**
3. Add this rule:

| Source | Target | Type |
|--------|--------|------|
| `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|js\|png\|txt\|svg\|woff\|woff2\|ttf\|map\|json)$)([^.]+$)/>` | `/index.html` | `200 (Rewrite)` |

4. Click **Save**

---

## 4. Azure AD SSO Configuration

### Step 4.1: Create Azure AD App Registration

1. **Go to Azure Portal:** https://portal.azure.com

2. **Navigate to:** Azure Active Directory → App registrations → New registration

3. **Configure:**
   - **Name:** `Cloud Compliance Canvas`
   - **Supported account types:** Single tenant (your organization only)
   - **Redirect URI:** 
     - Type: `Web`
     - URI: `https://YOUR-AMPLIFY-URL/callback`

4. **Click "Register"**

5. **Note these values:**
   - **Application (client) ID:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Directory (tenant) ID:** `yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy`

### Step 4.2: Create Client Secret

1. Go to **Certificates & secrets** → **New client secret**
2. **Description:** `Cloud Compliance Canvas Secret`
3. **Expires:** 24 months (recommended)
4. **Click "Add"**
5. **Copy the Value immediately** (you can't see it again!)

### Step 4.3: Configure API Permissions

1. Go to **API permissions** → **Add a permission**
2. Select **Microsoft Graph** → **Delegated permissions**
3. Add these permissions:
   - `email`
   - `openid`
   - `profile`
   - `User.Read`
4. Click **Grant admin consent** for your organization

### Step 4.4: Configure Token Claims (Optional)

1. Go to **Token configuration** → **Add optional claim**
2. Token type: **ID**
3. Select: `email`, `family_name`, `given_name`
4. Click **Add**

### Step 4.5: Create AWS Cognito User Pool

```bash
# Create User Pool
aws cognito-idp create-user-pool \
  --pool-name "cloud-compliance-canvas-users" \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": false
    }
  }' \
  --auto-verified-attributes email \
  --username-attributes email \
  --region us-east-1

# Note the UserPoolId from output
```

### Step 4.6: Add Azure AD as Identity Provider

```bash
# Replace with your values
USER_POOL_ID="us-east-1_XXXXXXXXX"
AZURE_CLIENT_ID="your-azure-client-id"
AZURE_CLIENT_SECRET="your-azure-client-secret"
AZURE_TENANT_ID="your-azure-tenant-id"

aws cognito-idp create-identity-provider \
  --user-pool-id $USER_POOL_ID \
  --provider-name AzureAD \
  --provider-type OIDC \
  --provider-details '{
    "client_id": "'$AZURE_CLIENT_ID'",
    "client_secret": "'$AZURE_CLIENT_SECRET'",
    "authorize_scopes": "openid profile email",
    "oidc_issuer": "https://login.microsoftonline.com/'$AZURE_TENANT_ID'/v2.0",
    "attributes_request_method": "GET"
  }' \
  --attribute-mapping '{
    "email": "email",
    "name": "name",
    "username": "sub"
  }' \
  --region us-east-1
```

### Step 4.7: Create App Client

```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name "cloud-compliance-canvas-client" \
  --generate-secret false \
  --supported-identity-providers COGNITO AzureAD \
  --callback-urls '["https://YOUR-AMPLIFY-URL","https://YOUR-AMPLIFY-URL/callback","http://localhost:5173","http://localhost:5173/callback"]' \
  --logout-urls '["https://YOUR-AMPLIFY-URL","http://localhost:5173"]' \
  --allowed-o-auth-flows code implicit \
  --allowed-o-auth-scopes email openid profile \
  --allowed-o-auth-flows-user-pool-client \
  --region us-east-1

# Note the ClientId from output
```

### Step 4.8: Create Cognito Domain

```bash
aws cognito-idp create-user-pool-domain \
  --user-pool-id $USER_POOL_ID \
  --domain "cloud-compliance-canvas-$(aws sts get-caller-identity --query Account --output text)" \
  --region us-east-1
```

### Step 4.9: Update Frontend Environment Variables

Update Amplify environment variables:

```bash
# In Amplify Console → App settings → Environment variables
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=your-cognito-client-id
VITE_COGNITO_DOMAIN=cloud-compliance-canvas-123456789012.auth.us-east-1.amazoncognito.com
VITE_AZURE_CLIENT_ID=your-azure-client-id
VITE_AZURE_TENANT_ID=your-azure-tenant-id
```

---

## 5. Custom Domain Setup

### Step 5.1: Add Domain in Amplify

1. Go to **Amplify Console** → Your App → **Domain management**
2. Click **Add domain**
3. Enter your domain: `compliance.yourcompany.com`
4. Click **Configure domain**

### Step 5.2: Configure DNS

Add these DNS records to your domain:

| Type | Name | Value |
|------|------|-------|
| CNAME | `compliance` | `d1234abcdef.cloudfront.net` |
| CNAME | `_xxxxxxxx.compliance` | `_yyyyyyyy.acm-validations.aws` |

### Step 5.3: Wait for SSL Certificate

- Certificate provisioning takes 15-30 minutes
- Status will change from "Pending verification" to "Available"

### Step 5.4: Update Azure AD Redirect URIs

Add your custom domain to Azure AD app registration:
- `https://compliance.yourcompany.com`
- `https://compliance.yourcompany.com/callback`

---

## 6. Post-Deployment Configuration

### 6.1 Enable Real AWS Data (Optional)

To connect to real AWS services instead of demo data:

1. **Update Lambda IAM Role:**
   - Add cross-account AssumeRole permissions
   - Configure trust relationships for your AWS accounts

2. **Update Environment Variables:**
   ```bash
   # In Amplify Console
   VITE_ENABLE_DEMO_MODE=false
   ```

3. **Configure AWS Organizations Role:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "AWS": "arn:aws:iam::BASE_ACCOUNT_ID:role/cloud-compliance-canvas-lambda-role"
         },
         "Action": "sts:AssumeRole"
       }
     ]
   }
   ```

### 6.2 Set Up CloudWatch Alarms

```bash
# Create alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name "CloudComplianceCanvas-LambdaErrors" \
  --alarm-description "Alarm when Lambda errors exceed threshold" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=FunctionName,Value=cloud-compliance-canvas-api-production \
  --region us-east-1
```

### 6.3 Enable Access Logging

1. Go to **Amplify Console** → Your App → **Access control**
2. Enable **Access logs**
3. Select S3 bucket for logs

---

## 7. Troubleshooting

### Common Issues

#### Issue: Build Fails in Amplify

**Solution:** Check build logs in Amplify Console
```bash
# Common fixes:
# 1. Ensure package-lock.json is committed
git add package-lock.json
git commit -m "Add package-lock.json"
git push

# 2. Clear Amplify cache
# In Amplify Console → App settings → General → Edit → Clear cache
```

#### Issue: 404 on Page Refresh

**Solution:** Add SPA rewrite rule (see Step 3.2.7)

#### Issue: CORS Errors

**Solution:** Update Lambda ALLOWED_ORIGINS
```bash
aws lambda update-function-configuration \
  --function-name cloud-compliance-canvas-api-production \
  --environment "Variables={ALLOWED_ORIGINS=https://your-amplify-url.amplifyapp.com}" \
  --region us-east-1
```

#### Issue: Azure AD Login Fails

**Solution:** Check:
1. Redirect URIs in Azure AD match exactly
2. Cognito User Pool Client has AzureAD in supported providers
3. Azure AD app has admin consent for permissions

#### Issue: API Returns 502 Bad Gateway

**Solution:** Check Lambda logs
```bash
aws logs tail /aws/lambda/cloud-compliance-canvas-api-production --follow
```

### Useful Commands

```bash
# View Lambda logs
aws logs tail /aws/lambda/cloud-compliance-canvas-api-production --follow

# Test API locally
sam local start-api --template-file infrastructure/template.yaml

# Delete all resources (cleanup)
aws cloudformation delete-stack --stack-name cloud-compliance-canvas-backend
aws amplify delete-app --app-id YOUR_APP_ID

# List all deployed stacks
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE
```

---

## 📌 Quick Reference

| Resource | URL/Command |
|----------|-------------|
| **Frontend** | `https://main.XXXXX.amplifyapp.com` |
| **API Health** | `https://XXXXX.execute-api.us-east-1.amazonaws.com/production/api/health` |
| **API Docs** | `https://XXXXX.execute-api.us-east-1.amazonaws.com/production/api/docs` |
| **Amplify Console** | `https://console.aws.amazon.com/amplify/` |
| **Lambda Console** | `https://console.aws.amazon.com/lambda/` |
| **CloudWatch Logs** | `https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups` |

---

## 🎉 Congratulations!

Your Cloud Compliance Canvas is now deployed on AWS!

**What's Working:**
- ✅ React frontend on AWS Amplify
- ✅ FastAPI backend on AWS Lambda
- ✅ API Gateway for routing
- ✅ Demo mode with sample data
- ✅ All 10 dashboard pages
- ✅ FinOps analytics
- ✅ Security findings
- ✅ Compliance tracking

**Optional Next Steps:**
- [ ] Configure Azure AD SSO
- [ ] Set up custom domain
- [ ] Enable real AWS data
- [ ] Configure CloudWatch alerts
- [ ] Add WAF for security

---

*Deployment Guide v1.0 | December 2025*
