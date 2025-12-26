#!/bin/bash
# ============================================================================
# Cloud Compliance Canvas - Complete Deployment Script
# ============================================================================
# This script deploys the complete infrastructure:
# 1. Backend API (Lambda + API Gateway) via SAM
# 2. Frontend (React on Amplify)
# 3. Authentication (Cognito with optional Azure AD)
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="${PROJECT_NAME:-cloud-compliance-canvas}"
ENVIRONMENT="${ENVIRONMENT:-production}"
AWS_REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="${PROJECT_NAME}-${ENVIRONMENT}"

# Print banner
echo -e "${BLUE}"
echo "============================================================================"
echo "       Cloud Compliance Canvas - AWS Deployment"
echo "============================================================================"
echo -e "${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}==>${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI not found. Please install it first."
        exit 1
    fi
    print_status "AWS CLI found"
    
    # Check SAM CLI
    if ! command -v sam &> /dev/null; then
        print_warning "AWS SAM CLI not found. Installing..."
        pip install aws-sam-cli
    fi
    print_status "AWS SAM CLI found"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js 18+."
        exit 1
    fi
    print_status "Node.js found: $(node --version)"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Run 'aws configure' first."
        exit 1
    fi
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    print_status "AWS Account: $ACCOUNT_ID"
    print_status "AWS Region: $AWS_REGION"
}

# Deploy backend API
deploy_backend() {
    print_step "Deploying Backend API (Lambda + API Gateway)..."
    
    cd infrastructure
    
    # Build SAM application
    print_status "Building SAM application..."
    sam build --template-file template.yaml
    
    # Deploy SAM application
    print_status "Deploying SAM application..."
    sam deploy \
        --stack-name "${STACK_NAME}-backend" \
        --region "$AWS_REGION" \
        --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
        --parameter-overrides \
            Environment="$ENVIRONMENT" \
            AllowedOrigins="*" \
        --no-confirm-changeset \
        --no-fail-on-empty-changeset
    
    # Get API URL
    API_URL=$(aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}-backend" \
        --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
        --output text \
        --region "$AWS_REGION")
    
    print_status "Backend API deployed: $API_URL"
    
    cd ..
    
    echo "$API_URL" > .api_url
}

# Deploy frontend to Amplify
deploy_frontend() {
    print_step "Deploying Frontend (Amplify)..."
    
    # Check if Amplify app exists
    AMPLIFY_APP_ID=$(aws amplify list-apps \
        --query "apps[?name=='${PROJECT_NAME}'].appId" \
        --output text \
        --region "$AWS_REGION" 2>/dev/null || echo "")
    
    if [ -z "$AMPLIFY_APP_ID" ] || [ "$AMPLIFY_APP_ID" == "None" ]; then
        print_status "Creating new Amplify app..."
        
        AMPLIFY_APP_ID=$(aws amplify create-app \
            --name "$PROJECT_NAME" \
            --description "Cloud Compliance Canvas - Enterprise AWS Governance Platform" \
            --platform WEB \
            --environment-variables \
                VITE_API_URL="$(cat .api_url)",\
                VITE_ENABLE_DEMO_MODE=true,\
                VITE_APP_NAME="Cloud Compliance Canvas" \
            --query "app.appId" \
            --output text \
            --region "$AWS_REGION")
        
        print_status "Amplify App created: $AMPLIFY_APP_ID"
    else
        print_status "Using existing Amplify app: $AMPLIFY_APP_ID"
        
        # Update environment variables
        aws amplify update-app \
            --app-id "$AMPLIFY_APP_ID" \
            --environment-variables \
                VITE_API_URL="$(cat .api_url)",\
                VITE_ENABLE_DEMO_MODE=true,\
                VITE_APP_NAME="Cloud Compliance Canvas" \
            --region "$AWS_REGION" > /dev/null
    fi
    
    # Build the React app
    print_status "Building React application..."
    npm ci
    npm run build
    
    # Create deployment
    print_status "Creating Amplify deployment..."
    
    # Create branch if it doesn't exist
    aws amplify create-branch \
        --app-id "$AMPLIFY_APP_ID" \
        --branch-name main \
        --stage PRODUCTION \
        --region "$AWS_REGION" 2>/dev/null || true
    
    # Create deployment and get upload URL
    DEPLOYMENT_INFO=$(aws amplify create-deployment \
        --app-id "$AMPLIFY_APP_ID" \
        --branch-name main \
        --region "$AWS_REGION")
    
    JOB_ID=$(echo "$DEPLOYMENT_INFO" | jq -r '.jobId')
    ZIP_UPLOAD_URL=$(echo "$DEPLOYMENT_INFO" | jq -r '.zipUploadUrl')
    
    # Create zip of dist folder
    print_status "Uploading build artifacts..."
    cd dist
    zip -r ../deployment.zip . -q
    cd ..
    
    # Upload zip file
    curl -s -X PUT -T deployment.zip -H "Content-Type: application/zip" "$ZIP_UPLOAD_URL"
    
    # Start deployment
    aws amplify start-deployment \
        --app-id "$AMPLIFY_APP_ID" \
        --branch-name main \
        --job-id "$JOB_ID" \
        --region "$AWS_REGION" > /dev/null
    
    # Wait for deployment
    print_status "Waiting for deployment to complete..."
    
    while true; do
        STATUS=$(aws amplify get-job \
            --app-id "$AMPLIFY_APP_ID" \
            --branch-name main \
            --job-id "$JOB_ID" \
            --query "job.summary.status" \
            --output text \
            --region "$AWS_REGION")
        
        if [ "$STATUS" == "SUCCEED" ]; then
            break
        elif [ "$STATUS" == "FAILED" ]; then
            print_error "Deployment failed!"
            exit 1
        fi
        
        echo -n "."
        sleep 5
    done
    
    echo ""
    
    # Get app URL
    AMPLIFY_URL=$(aws amplify get-app \
        --app-id "$AMPLIFY_APP_ID" \
        --query "app.defaultDomain" \
        --output text \
        --region "$AWS_REGION")
    
    print_status "Frontend deployed: https://$AMPLIFY_URL"
    
    # Cleanup
    rm -f deployment.zip .api_url
    
    echo "$AMPLIFY_APP_ID" > .amplify_app_id
    echo "https://$AMPLIFY_URL" > .amplify_url
}

# Configure SPA routing
configure_routing() {
    print_step "Configuring SPA routing..."
    
    AMPLIFY_APP_ID=$(cat .amplify_app_id)
    
    # Add rewrite rule for SPA
    aws amplify update-app \
        --app-id "$AMPLIFY_APP_ID" \
        --custom-rules '[{"source":"</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>","target":"/index.html","status":"200"}]' \
        --region "$AWS_REGION" > /dev/null
    
    print_status "SPA routing configured"
}

# Print summary
print_summary() {
    echo -e "\n${GREEN}"
    echo "============================================================================"
    echo "                    Deployment Complete!"
    echo "============================================================================"
    echo -e "${NC}"
    
    if [ -f .amplify_url ]; then
        echo -e "${BLUE}Frontend URL:${NC}  $(cat .amplify_url)"
    fi
    
    if [ -f .api_url ]; then
        echo -e "${BLUE}Backend API:${NC}   $(cat .api_url)"
    fi
    
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Open the Frontend URL in your browser"
    echo "2. The app starts in Demo Mode by default"
    echo "3. Configure Azure AD SSO in AWS Cognito (optional)"
    echo "4. Update environment variables for production"
    echo ""
    
    # Cleanup temp files
    rm -f .amplify_app_id .amplify_url .api_url
}

# Main execution
main() {
    check_prerequisites
    deploy_backend
    deploy_frontend
    configure_routing
    print_summary
}

# Run main function
main "$@"
