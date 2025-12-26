# AWS Amplify Deployment Guide
## Cloud Compliance Canvas - React Application

This guide walks you through deploying the Cloud Compliance Canvas React application to AWS Amplify in your base AWS account.

---

## Prerequisites

Before you begin, ensure you have:

- [ ] AWS Account with Administrator access
- [ ] AWS CLI installed and configured
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] GitHub/GitLab/CodeCommit account (for source code hosting)

---

## Method 1: AWS Console (Easiest) - Recommended

### Step 1: Push Code to Git Repository

First, create a new repository and push this code:

```bash
# Option A: GitHub
# 1. Go to https://github.com/new
# 2. Create repository named "cloud-compliance-canvas"
# 3. Then run:

cd react-finops-app
git init
git add .
git commit -m "Initial commit - Cloud Compliance Canvas React"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cloud-compliance-canvas.git
git push -u origin main
```

```bash
# Option B: AWS CodeCommit (Stays within AWS)
# 1. Create repository in AWS Console:
#    - Go to AWS Console → CodeCommit → Create Repository
#    - Name: cloud-compliance-canvas

# 2. Configure Git credentials:
aws codecommit credential-helper
git config --global credential.helper '!aws codecommit credential-helper $@'
git config --global credential.UseHttpPath true

# 3. Push code:
cd react-finops-app
git init
git add .
git commit -m "Initial commit - Cloud Compliance Canvas React"
git branch -M main
git remote add origin https://git-codecommit.us-east-1.amazonaws.com/v1/repos/cloud-compliance-canvas
git push -u origin main
```

### Step 2: Create Amplify App in AWS Console

1. **Open AWS Amplify Console**
   - Go to: https://console.aws.amazon.com/amplify/
   - Or search "Amplify" in AWS Console

2. **Click "Create new app"**

3. **Select Git Provider**
   - Choose: GitHub, GitLab, Bitbucket, or AWS CodeCommit
   - Click "Next"

4. **Authorize and Select Repository**
   - Authorize AWS Amplify to access your Git account
   - Select repository: `cloud-compliance-canvas`
   - Select branch: `main`
   - Click "Next"

5. **Configure Build Settings**
   
   Amplify should auto-detect the `amplify.yml` file. If not, use these settings:

   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

6. **Configure Environment Variables**
   
   Click "Advanced settings" and add:

   | Variable | Value | Description |
   |----------|-------|-------------|
   | `VITE_API_URL` | `https://your-api-url.com/api` | Backend API URL (add later) |
   | `VITE_ENABLE_DEMO_MODE` | `true` | Enable demo mode initially |
   | `VITE_APP_NAME` | `Cloud Compliance Canvas` | App name |

7. **Review and Create**
   - Review all settings
   - Click "Save and deploy"

8. **Wait for Deployment**
   - Build typically takes 2-5 minutes
   - You'll get a URL like: `https://main.d1234abcd.amplifyapp.com`

---

## Method 2: Amplify CLI (More Control)

### Step 1: Install Amplify CLI

```bash
# Install Amplify CLI globally
npm install -g @aws-amplify/cli

# Verify installation
amplify --version
```

### Step 2: Configure Amplify CLI

```bash
# Configure with your AWS credentials
amplify configure

# Follow the prompts:
# 1. Sign in to AWS Console (opens browser)
# 2. Specify AWS Region: us-east-1 (or your preferred region)
# 3. Create new IAM user: amplify-cli-user
# 4. Attach AdministratorAccess-Amplify policy
# 5. Enter Access Key ID and Secret Access Key
# 6. Profile name: default
```

### Step 3: Initialize Amplify in Your Project

```bash
cd react-finops-app

# Initialize Amplify
amplify init

# Answer the prompts:
# ? Enter a name for the project: cloudcompliancecanvas
# ? Initialize the project with the above configuration? Yes
# ? Select the authentication method: AWS profile
# ? Please choose the profile you want to use: default
```

### Step 4: Add Hosting

```bash
# Add hosting capability
amplify add hosting

# Answer the prompts:
# ? Select the plugin module to execute: Hosting with Amplify Console
# ? Choose a type: Continuous deployment (Git-based deployments)
# 
# This will open the Amplify Console in your browser
# Follow the steps to connect your Git repository
```

### Step 5: Deploy

```bash
# Deploy to Amplify
amplify publish

# Or for manual deployment (without CI/CD):
amplify add hosting
# Select: Hosting with Amplify Console
# Choose: Manual deployment

npm run build
amplify publish
```

---

## Method 3: AWS CLI Direct Deployment

### Step 1: Create Amplify App

```bash
# Set your region
export AWS_REGION=us-east-1

# Create the Amplify app
aws amplify create-app \
  --name "cloud-compliance-canvas" \
  --description "Enterprise AWS Governance Platform" \
  --platform WEB \
  --region $AWS_REGION

# Note the appId from the output (e.g., d1234567890abc)
export AMPLIFY_APP_ID=<your-app-id>
```

### Step 2: Create Branch

```bash
# Create a branch for deployment
aws amplify create-branch \
  --app-id $AMPLIFY_APP_ID \
  --branch-name main \
  --stage PRODUCTION \
  --enable-auto-build \
  --region $AWS_REGION
```

### Step 3: Build and Deploy

```bash
# Build the React app locally
cd react-finops-app
npm ci
npm run build

# Create a zip of the dist folder
cd dist
zip -r ../deployment.zip .
cd ..

# Create deployment
aws amplify create-deployment \
  --app-id $AMPLIFY_APP_ID \
  --branch-name main \
  --region $AWS_REGION

# Note the jobId and uploadUrl from output

# Upload the zip file
curl -T deployment.zip "<uploadUrl-from-previous-command>"

# Start the deployment
aws amplify start-deployment \
  --app-id $AMPLIFY_APP_ID \
  --branch-name main \
  --job-id <job-id-from-create-deployment> \
  --region $AWS_REGION
```

---

## Post-Deployment Configuration

### 1. Set Up Custom Domain (Optional)

```bash
# In AWS Console:
# 1. Go to Amplify → Your App → Domain management
# 2. Click "Add domain"
# 3. Enter your domain (e.g., compliance.yourcompany.com)
# 4. Follow DNS configuration steps
```

Or via CLI:

```bash
aws amplify create-domain-association \
  --app-id $AMPLIFY_APP_ID \
  --domain-name compliance.yourcompany.com \
  --sub-domain-settings prefix=,branchName=main \
  --region $AWS_REGION
```

### 2. Configure Environment Variables

```bash
# Add environment variables via CLI
aws amplify update-branch \
  --app-id $AMPLIFY_APP_ID \
  --branch-name main \
  --environment-variables \
    VITE_API_URL=https://api.yourcompany.com,\
    VITE_ENABLE_DEMO_MODE=true,\
    VITE_AZURE_CLIENT_ID=your-client-id,\
    VITE_AZURE_TENANT_ID=your-tenant-id \
  --region $AWS_REGION
```

### 3. Set Up Access Control (Password Protection)

For internal apps, enable basic auth:

```bash
# In AWS Console:
# 1. Go to Amplify → Your App → Access control
# 2. Click "Manage access control"
# 3. Set access: "Restricted - password required"
# 4. Add username and password
```

---

## Connecting to Backend API

### Option A: API Gateway + Lambda (Serverless)

1. Deploy your FastAPI backend to Lambda using AWS SAM or Serverless Framework
2. Create API Gateway endpoint
3. Update `VITE_API_URL` environment variable in Amplify

### Option B: ECS Fargate (Containers)

1. Create ECR repository and push FastAPI Docker image
2. Create ECS Fargate service
3. Create Application Load Balancer
4. Update `VITE_API_URL` environment variable

### Option C: Separate Backend Amplify App

You can deploy the FastAPI backend as a separate Amplify app with Docker support.

---

## Verification Checklist

After deployment, verify:

- [ ] App loads at Amplify URL
- [ ] Demo mode works (toggle in sidebar)
- [ ] All pages are accessible (Dashboard, FinOps, etc.)
- [ ] Charts render correctly
- [ ] No console errors
- [ ] HTTPS is working (automatic with Amplify)

---

## Troubleshooting

### Build Fails

```bash
# Check build logs in Amplify Console
# Common issues:

# 1. Node version mismatch
# Add to amplify.yml:
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 18
        - npm ci

# 2. Missing dependencies
# Ensure package-lock.json is committed

# 3. Build command issues
# Verify build works locally:
npm run build
```

### 404 on Page Refresh

Add rewrites for SPA routing. In Amplify Console:
1. Go to App settings → Rewrites and redirects
2. Add rule:
   - Source: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
   - Target: `/index.html`
   - Type: `200 (Rewrite)`

### Environment Variables Not Working

- Ensure variables start with `VITE_` prefix
- Rebuild after adding/changing variables
- Variables are build-time, not runtime

---

## Cost Estimate

AWS Amplify pricing for this application:

| Component | Free Tier | Estimated Cost |
|-----------|-----------|----------------|
| Build minutes | 1,000/month | ~$0.01/min after |
| Hosting (GB served) | 15 GB/month | ~$0.15/GB after |
| Hosting (requests) | 500K/month | ~$0.0085/1K after |
| **Total (low traffic)** | **Free** | **$0-5/month** |
| **Total (medium traffic)** | - | **$20-50/month** |

---

## Next Steps

1. **Deploy Backend API** - Set up FastAPI on Lambda or ECS
2. **Configure Azure AD SSO** - Add your Azure AD app registration
3. **Connect to AWS Services** - Enable IAM role for cross-account access
4. **Set Up Monitoring** - Enable CloudWatch and X-Ray
5. **Add CI/CD Pipeline** - Configure branch deployments and PR previews

---

## Quick Reference Commands

```bash
# Check Amplify status
amplify status

# View app in Console
amplify console

# Push changes
git add . && git commit -m "Update" && git push

# Delete app (cleanup)
amplify delete
```

---

*Deployment Guide v1.0 | December 2025*
