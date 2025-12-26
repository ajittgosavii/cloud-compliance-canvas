"""
Cloud Compliance Canvas - FastAPI Backend for AWS Lambda
Uses Mangum adapter to run FastAPI on AWS Lambda + API Gateway
"""

import os
import json
import random
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from functools import lru_cache

from fastapi import FastAPI, HTTPException, Depends, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from mangum import Mangum

# ============================================================================
# Configuration
# ============================================================================

class Settings:
    APP_NAME: str = "Cloud Compliance Canvas API"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    ALLOWED_ORIGINS: List[str] = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:5173,http://localhost:3000,https://*.amplifyapp.com"
    ).split(",")
    CLAUDE_API_KEY: str = os.getenv("CLAUDE_API_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")

settings = Settings()

# ============================================================================
# FastAPI App Setup
# ============================================================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Enterprise AWS Governance Platform API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, use specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Pydantic Models
# ============================================================================

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    services: Dict[str, str]

class SecurityFinding(BaseModel):
    id: str
    title: str
    severity: str
    status: str
    resource_type: str
    resource_id: str
    account_id: str
    region: str
    created_at: str
    compliance_status: Optional[str] = None

class ComplianceScore(BaseModel):
    overall_score: float
    frameworks: Dict[str, float]
    trend: str
    last_updated: str

class CostOverview(BaseModel):
    mtd_cost: float
    forecasted_cost: float
    budget: float
    budget_utilization: float
    cost_change_percent: float
    top_services: List[Dict[str, Any]]

class SavingsRecommendation(BaseModel):
    id: str
    type: str
    title: str
    description: str
    estimated_monthly_savings: float
    estimated_annual_savings: float
    effort: str
    resource_count: int

class AWSAccount(BaseModel):
    account_id: str
    account_name: str
    environment: str
    status: str
    compliance_score: float
    monthly_cost: float
    finding_count: int

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    tokens_used: int

# ============================================================================
# Demo Data Generators
# ============================================================================

def generate_security_findings(count: int = 50) -> List[Dict]:
    """Generate demo security findings"""
    severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"]
    statuses = ["ACTIVE", "RESOLVED", "SUPPRESSED"]
    resource_types = ["AWS::EC2::Instance", "AWS::S3::Bucket", "AWS::IAM::Role", 
                      "AWS::RDS::DBInstance", "AWS::Lambda::Function", "AWS::EKS::Cluster"]
    
    findings = []
    for i in range(count):
        severity = random.choices(severities, weights=[5, 15, 30, 30, 20])[0]
        findings.append({
            "id": f"finding-{i+1:04d}",
            "title": f"Security finding {i+1} - {severity} severity issue detected",
            "severity": severity,
            "status": random.choices(statuses, weights=[70, 25, 5])[0],
            "resource_type": random.choice(resource_types),
            "resource_id": f"resource-{random.randint(1000, 9999)}",
            "account_id": f"{random.randint(100000000000, 999999999999)}",
            "region": random.choice(["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"]),
            "created_at": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
            "compliance_status": random.choice(["PASSED", "FAILED", "NOT_AVAILABLE"])
        })
    return findings

def generate_compliance_scores() -> Dict:
    """Generate demo compliance scores by framework"""
    frameworks = {
        "SOC 2": random.uniform(75, 98),
        "PCI-DSS": random.uniform(70, 95),
        "HIPAA": random.uniform(72, 96),
        "GDPR": random.uniform(68, 94),
        "ISO 27001": random.uniform(74, 97),
        "NIST 800-53": random.uniform(70, 95),
        "CIS AWS": random.uniform(65, 92),
        "AWS Well-Architected": random.uniform(72, 96)
    }
    overall = sum(frameworks.values()) / len(frameworks)
    return {
        "overall_score": round(overall, 1),
        "frameworks": {k: round(v, 1) for k, v in frameworks.items()},
        "trend": random.choice(["improving", "stable", "declining"]),
        "last_updated": datetime.now().isoformat()
    }

def generate_cost_overview() -> Dict:
    """Generate demo cost overview"""
    mtd = random.uniform(150000, 300000)
    budget = 350000
    return {
        "mtd_cost": round(mtd, 2),
        "forecasted_cost": round(mtd * 1.2, 2),
        "budget": budget,
        "budget_utilization": round((mtd / budget) * 100, 1),
        "cost_change_percent": round(random.uniform(-15, 25), 1),
        "top_services": [
            {"service": "Amazon EC2", "cost": round(mtd * 0.35, 2), "change": round(random.uniform(-10, 15), 1)},
            {"service": "Amazon RDS", "cost": round(mtd * 0.20, 2), "change": round(random.uniform(-5, 10), 1)},
            {"service": "Amazon S3", "cost": round(mtd * 0.12, 2), "change": round(random.uniform(-8, 12), 1)},
            {"service": "AWS Lambda", "cost": round(mtd * 0.08, 2), "change": round(random.uniform(-20, 30), 1)},
            {"service": "Amazon EKS", "cost": round(mtd * 0.10, 2), "change": round(random.uniform(-5, 20), 1)},
        ],
        "daily_costs": [
            {"date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"), 
             "amount": round(random.uniform(8000, 12000), 2)}
            for i in range(30, 0, -1)
        ]
    }

def generate_savings_recommendations() -> List[Dict]:
    """Generate demo savings recommendations"""
    return [
        {
            "id": "rec-001",
            "type": "Savings Plans",
            "title": "Purchase Compute Savings Plans",
            "description": "Based on your consistent EC2 and Fargate usage, purchasing 1-year Compute Savings Plans could reduce costs significantly.",
            "estimated_monthly_savings": 12500,
            "estimated_annual_savings": 150000,
            "effort": "Low",
            "resource_count": 156
        },
        {
            "id": "rec-002",
            "type": "Reserved Instances",
            "title": "Convert On-Demand RDS to Reserved",
            "description": "Your RDS instances have been running consistently for 6+ months. Reserved Instances would reduce costs.",
            "estimated_monthly_savings": 8200,
            "estimated_annual_savings": 98400,
            "effort": "Low",
            "resource_count": 23
        },
        {
            "id": "rec-003",
            "type": "Rightsizing",
            "title": "Rightsize underutilized EC2 instances",
            "description": "47 EC2 instances are running at less than 20% CPU utilization. Consider downsizing.",
            "estimated_monthly_savings": 5600,
            "estimated_annual_savings": 67200,
            "effort": "Medium",
            "resource_count": 47
        },
        {
            "id": "rec-004",
            "type": "Idle Resources",
            "title": "Terminate idle resources",
            "description": "Found 12 unattached EBS volumes, 8 idle Elastic IPs, and 15 unused NAT Gateways.",
            "estimated_monthly_savings": 3200,
            "estimated_annual_savings": 38400,
            "effort": "Low",
            "resource_count": 35
        },
        {
            "id": "rec-005",
            "type": "Storage Optimization",
            "title": "Optimize S3 storage classes",
            "description": "Move infrequently accessed data to S3 Glacier or Intelligent-Tiering.",
            "estimated_monthly_savings": 2100,
            "estimated_annual_savings": 25200,
            "effort": "Medium",
            "resource_count": 89
        }
    ]

def generate_aws_accounts(count: int = 20) -> List[Dict]:
    """Generate demo AWS accounts"""
    environments = ["Production", "Development", "Staging", "Sandbox", "Security", "Shared Services"]
    accounts = []
    for i in range(count):
        env = random.choice(environments)
        accounts.append({
            "account_id": f"{random.randint(100000000000, 999999999999)}",
            "account_name": f"{env.lower()}-account-{i+1:03d}",
            "environment": env,
            "status": random.choices(["Active", "Suspended", "Pending"], weights=[90, 5, 5])[0],
            "compliance_score": round(random.uniform(65, 98), 1),
            "monthly_cost": round(random.uniform(5000, 50000), 2),
            "finding_count": random.randint(0, 50)
        })
    return accounts

def generate_dashboard_data() -> Dict:
    """Generate complete dashboard data"""
    findings = generate_security_findings(100)
    
    severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFORMATIONAL": 0}
    for f in findings:
        severity_counts[f["severity"]] += 1
    
    return {
        "key_metrics": [
            {"title": "Total Findings", "value": len(findings), "change": -12, "icon": "shield"},
            {"title": "Critical Issues", "value": severity_counts["CRITICAL"], "change": -3, "icon": "alert-triangle"},
            {"title": "Compliance Score", "value": "87.3%", "change": 5.2, "icon": "check-circle"},
            {"title": "AWS Accounts", "value": 640, "change": 0, "icon": "users"},
            {"title": "MTD Cost", "value": "$247,832", "change": 8.5, "icon": "dollar-sign"}
        ],
        "findings": severity_counts,
        "compliance": generate_compliance_scores(),
        "accounts_summary": {
            "total": 640,
            "by_environment": {
                "Production": 85,
                "Development": 234,
                "Staging": 120,
                "Sandbox": 156,
                "Security": 15,
                "Shared Services": 30
            }
        },
        "trend_data": {
            "dates": [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(30, 0, -1)],
            "critical": [random.randint(5, 15) for _ in range(30)],
            "high": [random.randint(20, 40) for _ in range(30)],
            "medium": [random.randint(30, 60) for _ in range(30)]
        },
        "recent_findings": findings[:10]
    }

# ============================================================================
# API Routes
# ============================================================================

@app.get("/api/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "operational",
            "database": "operational",
            "aws_connection": "demo_mode",
            "claude_ai": "available" if settings.CLAUDE_API_KEY else "not_configured"
        }
    }

@app.get("/api/dashboard", tags=["Dashboard"])
async def get_dashboard_data(demo_mode: bool = True):
    """Get dashboard overview data"""
    return generate_dashboard_data()

# Security Routes
@app.get("/api/security/findings", tags=["Security"])
async def get_security_findings(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(default=50, le=500)
):
    """Get security findings from Security Hub"""
    findings = generate_security_findings(limit)
    
    if severity:
        findings = [f for f in findings if f["severity"] == severity.upper()]
    if status:
        findings = [f for f in findings if f["status"] == status.upper()]
    
    return {"findings": findings, "total": len(findings)}

@app.get("/api/security/guardduty", tags=["Security"])
async def get_guardduty_findings(limit: int = 50):
    """Get GuardDuty findings"""
    findings = []
    threat_types = ["UnauthorizedAccess", "Recon", "Trojan", "CryptoCurrency", "Backdoor"]
    
    for i in range(limit):
        findings.append({
            "id": f"gd-{i+1:04d}",
            "type": random.choice(threat_types),
            "severity": round(random.uniform(1, 8.9), 1),
            "title": f"GuardDuty finding - {random.choice(threat_types)} detected",
            "description": "Suspicious activity detected in your AWS environment",
            "resource": f"i-{random.randint(10000000, 99999999):08x}",
            "created_at": (datetime.now() - timedelta(days=random.randint(0, 14))).isoformat()
        })
    
    return {"findings": findings, "total": len(findings)}

@app.get("/api/security/inspector", tags=["Security"])
async def get_inspector_findings(limit: int = 50):
    """Get Inspector vulnerability findings"""
    findings = []
    vuln_types = ["CVE", "Network Reachability", "Package Vulnerability", "Code Vulnerability"]
    
    for i in range(limit):
        findings.append({
            "id": f"inspector-{i+1:04d}",
            "type": random.choice(vuln_types),
            "severity": random.choice(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
            "title": f"Vulnerability: CVE-2024-{random.randint(1000, 9999)}",
            "package": f"package-{random.randint(1, 100)}",
            "fixed_version": f"{random.randint(1,5)}.{random.randint(0,9)}.{random.randint(0,9)}",
            "resource": f"arn:aws:ec2:us-east-1:123456789012:instance/i-{random.randint(10000000, 99999999):08x}",
            "created_at": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat()
        })
    
    return {"findings": findings, "total": len(findings)}

# Compliance Routes
@app.get("/api/compliance/score", response_model=ComplianceScore, tags=["Compliance"])
async def get_compliance_score():
    """Get overall compliance score"""
    data = generate_compliance_scores()
    return ComplianceScore(**data)

@app.get("/api/compliance/frameworks", tags=["Compliance"])
async def get_compliance_frameworks():
    """Get compliance status by framework"""
    scores = generate_compliance_scores()
    frameworks = []
    
    for name, score in scores["frameworks"].items():
        total_controls = random.randint(80, 200)
        passed = int(total_controls * (score / 100))
        frameworks.append({
            "name": name,
            "score": score,
            "total_controls": total_controls,
            "passed_controls": passed,
            "failed_controls": total_controls - passed,
            "status": "Compliant" if score >= 80 else "Non-Compliant"
        })
    
    return {"frameworks": frameworks}

# FinOps Routes
@app.get("/api/finops/overview", tags=["FinOps"])
async def get_cost_overview():
    """Get cost overview"""
    return generate_cost_overview()

@app.get("/api/finops/by-service", tags=["FinOps"])
async def get_cost_by_service():
    """Get costs broken down by service"""
    services = [
        "Amazon EC2", "Amazon RDS", "Amazon S3", "AWS Lambda", "Amazon EKS",
        "Amazon CloudFront", "Amazon DynamoDB", "AWS Fargate", "Amazon ElastiCache",
        "Amazon Redshift", "AWS Glue", "Amazon SageMaker", "Amazon API Gateway"
    ]
    
    return {
        "services": [
            {
                "service": service,
                "mtd_cost": round(random.uniform(5000, 80000), 2),
                "last_month_cost": round(random.uniform(5000, 80000), 2),
                "change_percent": round(random.uniform(-20, 30), 1),
                "trend": [round(random.uniform(150, 300), 2) for _ in range(30)]
            }
            for service in services
        ]
    }

@app.get("/api/finops/by-account", tags=["FinOps"])
async def get_cost_by_account():
    """Get costs broken down by account"""
    accounts = generate_aws_accounts(30)
    return {
        "accounts": [
            {
                "account_id": acc["account_id"],
                "account_name": acc["account_name"],
                "environment": acc["environment"],
                "mtd_cost": acc["monthly_cost"],
                "budget": round(acc["monthly_cost"] * random.uniform(1.1, 1.5), 2),
                "utilization": round(random.uniform(50, 110), 1)
            }
            for acc in accounts
        ]
    }

@app.get("/api/finops/savings", tags=["FinOps"])
async def get_savings_recommendations():
    """Get cost savings recommendations"""
    return {"recommendations": generate_savings_recommendations()}

@app.get("/api/finops/anomalies", tags=["FinOps"])
async def get_cost_anomalies():
    """Get cost anomalies"""
    anomalies = []
    for i in range(random.randint(3, 8)):
        anomalies.append({
            "id": f"anomaly-{i+1:03d}",
            "service": random.choice(["EC2", "RDS", "S3", "Lambda", "EKS"]),
            "account_id": f"{random.randint(100000000000, 999999999999)}",
            "expected_cost": round(random.uniform(1000, 10000), 2),
            "actual_cost": round(random.uniform(5000, 50000), 2),
            "impact": round(random.uniform(1000, 40000), 2),
            "root_cause": random.choice([
                "Unusual spike in data transfer",
                "New resources provisioned",
                "Increased API calls",
                "Storage growth exceeds normal",
                "Compute usage spike"
            ]),
            "detected_at": (datetime.now() - timedelta(hours=random.randint(1, 72))).isoformat(),
            "status": random.choice(["Open", "Investigating", "Resolved"])
        })
    
    return {"anomalies": anomalies}

@app.get("/api/finops/budgets", tags=["FinOps"])
async def get_budgets():
    """Get budget tracking"""
    budgets = []
    budget_names = ["Overall AWS", "Production", "Development", "Data Platform", "Security Tools"]
    
    for name in budget_names:
        limit = random.randint(50000, 200000)
        actual = round(limit * random.uniform(0.4, 1.1), 2)
        budgets.append({
            "name": name,
            "limit": limit,
            "actual": actual,
            "forecasted": round(actual * random.uniform(1.0, 1.3), 2),
            "utilization": round((actual / limit) * 100, 1),
            "status": "On Track" if actual < limit * 0.9 else "At Risk" if actual < limit else "Over Budget",
            "alerts_triggered": random.randint(0, 3)
        })
    
    return {"budgets": budgets}

# Accounts Routes
@app.get("/api/accounts", tags=["Accounts"])
async def get_aws_accounts(
    environment: Optional[str] = None,
    status: Optional[str] = None
):
    """Get AWS accounts"""
    accounts = generate_aws_accounts(50)
    
    if environment:
        accounts = [a for a in accounts if a["environment"].lower() == environment.lower()]
    if status:
        accounts = [a for a in accounts if a["status"].lower() == status.lower()]
    
    return {"accounts": accounts, "total": len(accounts)}

@app.post("/api/accounts/provision", tags=["Accounts"])
async def provision_account(request: Dict[str, Any]):
    """Provision a new AWS account"""
    return {
        "status": "success",
        "message": "Account provisioning initiated",
        "request_id": f"req-{random.randint(100000, 999999)}",
        "estimated_time": "15-20 minutes",
        "account_details": {
            "name": request.get("account_name", "new-account"),
            "environment": request.get("environment", "Development"),
            "template": request.get("template", "standard")
        }
    }

# Guardrails Routes
@app.get("/api/guardrails/scp", tags=["Guardrails"])
async def get_scp_policies():
    """Get Service Control Policies"""
    policies = [
        {"id": "scp-001", "name": "DenyRootUser", "description": "Deny root user access", "attached_ous": 12, "status": "Active"},
        {"id": "scp-002", "name": "RequireIMDSv2", "description": "Require IMDSv2 for EC2", "attached_ous": 8, "status": "Active"},
        {"id": "scp-003", "name": "DenyLeaveOrg", "description": "Prevent leaving organization", "attached_ous": 15, "status": "Active"},
        {"id": "scp-004", "name": "RequireEncryption", "description": "Require encryption at rest", "attached_ous": 10, "status": "Active"},
        {"id": "scp-005", "name": "RestrictRegions", "description": "Limit to approved regions", "attached_ous": 12, "status": "Active"},
    ]
    return {"policies": policies}

@app.get("/api/guardrails/opa", tags=["Guardrails"])
async def get_opa_policies():
    """Get OPA policies"""
    policies = [
        {"id": "opa-001", "name": "require-tags", "description": "Require mandatory tags on resources", "violations": 23, "status": "Enforcing"},
        {"id": "opa-002", "name": "restrict-instance-types", "description": "Limit allowed EC2 instance types", "violations": 5, "status": "Enforcing"},
        {"id": "opa-003", "name": "require-private-subnet", "description": "RDS must be in private subnet", "violations": 0, "status": "Enforcing"},
        {"id": "opa-004", "name": "s3-encryption", "description": "S3 buckets must have encryption", "violations": 8, "status": "Monitoring"},
    ]
    return {"policies": policies}

# AI Routes
@app.post("/api/ai/chat", tags=["AI"])
async def ai_chat(request: ChatRequest):
    """Chat with Claude AI for insights"""
    # In production, this would call the Anthropic API
    # For demo, return a simulated response
    
    user_message = request.messages[-1].content if request.messages else ""
    
    # Simulated AI responses based on keywords
    if "cost" in user_message.lower() or "spend" in user_message.lower():
        response = """Based on your current AWS spending patterns, I've identified several optimization opportunities:

1. **Compute Savings**: Your EC2 usage shows consistent patterns. Purchasing Compute Savings Plans could save approximately $12,500/month.

2. **Idle Resources**: I found 35 idle resources (EBS volumes, Elastic IPs, NAT Gateways) costing ~$3,200/month.

3. **Storage Optimization**: Moving 2.3TB of infrequently accessed S3 data to Glacier could save $2,100/month.

**Total Potential Savings: $31,600/month ($379,200/year)**

Would you like me to generate a detailed remediation plan for any of these?"""

    elif "security" in user_message.lower() or "finding" in user_message.lower():
        response = """Here's a summary of your security posture:

**Critical Issues (Immediate Action Required):**
- 8 EC2 instances with public IPs and open security groups
- 3 S3 buckets with public read access
- 5 IAM users without MFA enabled

**High Priority:**
- 23 resources missing required encryption
- 12 Lambda functions with overly permissive IAM roles

**Recommendations:**
1. Enable IMDSv2 on all EC2 instances
2. Review and restrict S3 bucket policies
3. Enforce MFA for all IAM users

I can generate remediation scripts for any of these findings. Which would you like to address first?"""

    elif "compliance" in user_message.lower():
        response = """Your current compliance status across frameworks:

| Framework | Score | Status |
|-----------|-------|--------|
| SOC 2 | 87.3% | ✅ Compliant |
| PCI-DSS | 82.1% | ✅ Compliant |
| HIPAA | 79.5% | ⚠️ At Risk |
| GDPR | 85.2% | ✅ Compliant |
| ISO 27001 | 88.7% | ✅ Compliant |

**HIPAA Gap Analysis:**
- 12 controls require attention
- Primary gaps: encryption at rest, access logging, audit trails

Would you like me to create a remediation roadmap for HIPAA compliance?"""

    else:
        response = f"""I understand you're asking about: "{user_message}"

As your AI-powered cloud governance assistant, I can help you with:

1. **Cost Analysis** - Identify savings opportunities and anomalies
2. **Security Insights** - Analyze findings and generate remediation plans
3. **Compliance** - Track framework compliance and gaps
4. **Resource Optimization** - Right-sizing and idle resource detection

How can I assist you today?"""

    return {
        "response": response,
        "tokens_used": len(response.split()) * 2  # Approximate
    }

@app.get("/api/ai/predictions", tags=["AI"])
async def get_ai_predictions():
    """Get AI-generated predictions and insights"""
    return {
        "predictions": [
            {
                "id": "pred-001",
                "type": "cost",
                "title": "Cost Spike Predicted",
                "description": "Based on current trends, expect 15% cost increase next month due to data transfer growth",
                "confidence": 0.87,
                "impact": "high",
                "recommended_action": "Review data transfer patterns and consider CloudFront optimization"
            },
            {
                "id": "pred-002",
                "type": "security",
                "title": "Potential Security Risk",
                "description": "3 EC2 instances showing unusual outbound traffic patterns",
                "confidence": 0.72,
                "impact": "critical",
                "recommended_action": "Investigate network flows and review security groups"
            },
            {
                "id": "pred-003",
                "type": "capacity",
                "title": "Capacity Planning Alert",
                "description": "RDS storage utilization trending toward 90% in 2 weeks",
                "confidence": 0.91,
                "impact": "medium",
                "recommended_action": "Plan storage expansion or implement data archival"
            }
        ],
        "generated_at": datetime.now().isoformat()
    }

# Remediation Routes
@app.get("/api/remediation/plans", tags=["Remediation"])
async def get_remediation_plans():
    """Get remediation plans"""
    return {
        "plans": [
            {
                "id": "plan-001",
                "name": "Critical Security Remediation",
                "findings_count": 15,
                "status": "In Progress",
                "progress": 45,
                "created_at": (datetime.now() - timedelta(days=3)).isoformat()
            },
            {
                "id": "plan-002",
                "name": "Cost Optimization Sprint",
                "findings_count": 35,
                "status": "Pending Approval",
                "progress": 0,
                "created_at": (datetime.now() - timedelta(days=1)).isoformat()
            }
        ]
    }

@app.post("/api/remediation/generate-code", tags=["Remediation"])
async def generate_remediation_code(finding_id: str, language: str = "terraform"):
    """Generate remediation code for a finding"""
    
    if language == "terraform":
        code = '''# Auto-generated remediation for finding: ''' + finding_id + '''

resource "aws_s3_bucket_public_access_block" "remediation" {
  bucket = aws_s3_bucket.example.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "remediation" {
  bucket = aws_s3_bucket.example.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}'''
    elif language == "cloudformation":
        code = '''# Auto-generated CloudFormation remediation
AWSTemplateFormatVersion: '2010-09-09'
Description: Remediation for ''' + finding_id + '''

Resources:
  S3BucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref MyBucket
      PolicyDocument:
        Statement:
          - Effect: Deny
            Principal: '*'
            Action: 's3:*'
            Resource: !Sub '${MyBucket.Arn}/*'
            Condition:
              Bool:
                'aws:SecureTransport': 'false' '''
    else:
        code = f"# Remediation code for {finding_id}\n# Language: {language}"
    
    return {
        "finding_id": finding_id,
        "language": language,
        "code": code,
        "generated_at": datetime.now().isoformat()
    }

# ============================================================================
# Lambda Handler (Mangum)
# ============================================================================

# Create the handler for AWS Lambda
handler = Mangum(app, lifespan="off")

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
