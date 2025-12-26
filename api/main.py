"""
FastAPI Backend for Cloud Compliance Canvas
Reuses existing Python modules from Streamlit application
"""

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import json
import os

# Initialize FastAPI app
app = FastAPI(
    title="Cloud Compliance Canvas API",
    description="Enterprise AWS Governance Platform API",
    version="6.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# ============================================================
# Import existing Streamlit modules
# ============================================================

# These imports reuse your existing Python code!
try:
    from aws_finops_data import (
        fetch_cost_overview,
        fetch_aiml_costs,
        fetch_cost_anomalies,
        fetch_savings_recommendations,
        fetch_budget_status,
        fetch_cost_by_account,
        fetch_cost_forecast,
    )
    FINOPS_AVAILABLE = True
except ImportError:
    FINOPS_AVAILABLE = False
    print("⚠️ FinOps module not available")

try:
    from claude_predictions import (
        predict_monthly_cost,
        predict_security_risks,
        predict_compliance_drift,
        chat_with_claude,
    )
    PREDICTIONS_AVAILABLE = True
except ImportError:
    PREDICTIONS_AVAILABLE = False
    print("⚠️ Predictions module not available")

try:
    from aws_connector import get_aws_client, test_aws_connection
    AWS_CONNECTOR_AVAILABLE = True
except ImportError:
    AWS_CONNECTOR_AVAILABLE = False
    print("⚠️ AWS connector not available")

# ============================================================
# Pydantic Models
# ============================================================

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None
    timestamp: str = datetime.utcnow().isoformat()

class CostOverview(BaseModel):
    currentMonthCost: float
    previousMonthCost: float
    forecastedMonthCost: float
    monthOverMonthChange: float
    yearToDateCost: float
    budgetAmount: float
    budgetUsedPercent: float

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class PredictionRequest(BaseModel):
    type: str  # cost, security, compliance, capacity, operational
    context: Optional[Dict[str, Any]] = None

# ============================================================
# Health & Status Endpoints
# ============================================================

@app.get("/")
async def root():
    return {"message": "Cloud Compliance Canvas API", "version": "6.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "modules": {
            "finops": FINOPS_AVAILABLE,
            "predictions": PREDICTIONS_AVAILABLE,
            "aws_connector": AWS_CONNECTOR_AVAILABLE,
        },
        "timestamp": datetime.utcnow().isoformat(),
    }

# ============================================================
# Dashboard Endpoints
# ============================================================

@app.get("/api/dashboard")
async def get_dashboard_data(demo_mode: bool = Query(True)):
    """Get comprehensive dashboard data"""
    if demo_mode:
        return ApiResponse(
            success=True,
            data=generate_demo_dashboard_data(),
            message="Demo data returned",
        )
    
    # Live mode - fetch real AWS data
    try:
        # Aggregate data from multiple sources
        data = {
            "keyMetrics": await get_key_metrics(),
            "findings": await get_findings_summary(),
            "complianceScore": await get_compliance_score(),
            "costOverview": await get_cost_overview(),
        }
        return ApiResponse(success=True, data=data)
    except Exception as e:
        return ApiResponse(success=False, error=str(e))

# ============================================================
# Security Endpoints
# ============================================================

@app.get("/api/security/security-hub")
async def get_security_hub_findings(
    severity: Optional[List[str]] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
):
    """Get Security Hub findings"""
    try:
        if not AWS_CONNECTOR_AVAILABLE:
            return ApiResponse(success=True, data=generate_demo_security_hub_data())
        
        client = get_aws_client("securityhub")
        # Reuse your existing fetch_security_hub_findings logic here
        return ApiResponse(success=True, data=generate_demo_security_hub_data())
    except Exception as e:
        return ApiResponse(success=False, error=str(e))

@app.get("/api/security/guardduty")
async def get_guardduty_findings(
    severity: Optional[int] = Query(None),
    limit: int = Query(50, le=200),
):
    """Get GuardDuty findings"""
    return ApiResponse(success=True, data=generate_demo_guardduty_data())

@app.get("/api/security/inspector")
async def get_inspector_findings(
    severity: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
):
    """Get Inspector findings"""
    return ApiResponse(success=True, data=generate_demo_inspector_data())

@app.get("/api/security/config")
async def get_config_compliance():
    """Get AWS Config compliance status"""
    return ApiResponse(success=True, data=generate_demo_config_data())

# ============================================================
# FinOps Endpoints
# ============================================================

@app.get("/api/finops/overview")
async def get_finops_overview(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """Get cost overview"""
    if FINOPS_AVAILABLE:
        try:
            data = fetch_cost_overview()
            return ApiResponse(success=True, data=data)
        except Exception as e:
            return ApiResponse(success=False, error=str(e))
    
    return ApiResponse(success=True, data=generate_demo_cost_overview())

@app.get("/api/finops/by-service")
async def get_cost_by_service(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(10),
):
    """Get costs broken down by service"""
    return ApiResponse(success=True, data=generate_demo_service_costs())

@app.get("/api/finops/by-account")
async def get_cost_by_account(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """Get costs broken down by account"""
    if FINOPS_AVAILABLE:
        try:
            data = fetch_cost_by_account()
            return ApiResponse(success=True, data=data)
        except Exception as e:
            return ApiResponse(success=False, error=str(e))
    
    return ApiResponse(success=True, data=generate_demo_account_costs())

@app.get("/api/finops/recommendations")
async def get_savings_recommendations():
    """Get cost savings recommendations"""
    if FINOPS_AVAILABLE:
        try:
            data = fetch_savings_recommendations()
            return ApiResponse(success=True, data=data)
        except Exception as e:
            return ApiResponse(success=False, error=str(e))
    
    return ApiResponse(success=True, data=generate_demo_recommendations())

@app.get("/api/finops/anomalies")
async def get_cost_anomalies(
    status: Optional[str] = Query(None),
    limit: int = Query(10),
):
    """Get cost anomalies"""
    if FINOPS_AVAILABLE:
        try:
            data = fetch_cost_anomalies()
            return ApiResponse(success=True, data=data)
        except Exception as e:
            return ApiResponse(success=False, error=str(e))
    
    return ApiResponse(success=True, data=generate_demo_anomalies())

@app.get("/api/finops/budgets")
async def get_budgets():
    """Get budget status"""
    if FINOPS_AVAILABLE:
        try:
            data = fetch_budget_status()
            return ApiResponse(success=True, data=data)
        except Exception as e:
            return ApiResponse(success=False, error=str(e))
    
    return ApiResponse(success=True, data=generate_demo_budgets())

@app.get("/api/finops/forecast")
async def get_cost_forecast():
    """Get cost forecast"""
    if FINOPS_AVAILABLE:
        try:
            data = fetch_cost_forecast()
            return ApiResponse(success=True, data=data)
        except Exception as e:
            return ApiResponse(success=False, error=str(e))
    
    return ApiResponse(success=True, data=generate_demo_forecast())

# ============================================================
# AI & Predictions Endpoints
# ============================================================

@app.get("/api/ai/predictions")
async def get_predictions(type: Optional[str] = Query(None)):
    """Get AI predictions"""
    return ApiResponse(success=True, data=generate_demo_predictions(type))

@app.post("/api/ai/predictions/generate")
async def generate_prediction(request: PredictionRequest):
    """Generate a new prediction using Claude"""
    if PREDICTIONS_AVAILABLE:
        try:
            if request.type == "cost":
                data = predict_monthly_cost(request.context)
            elif request.type == "security":
                data = predict_security_risks(request.context)
            elif request.type == "compliance":
                data = predict_compliance_drift(request.context)
            else:
                data = {"message": "Unknown prediction type"}
            
            return ApiResponse(success=True, data=data)
        except Exception as e:
            return ApiResponse(success=False, error=str(e))
    
    return ApiResponse(success=True, data=generate_demo_predictions(request.type))

@app.post("/api/ai/chat")
async def chat_with_ai(request: ChatRequest):
    """Chat with Claude AI"""
    if PREDICTIONS_AVAILABLE:
        try:
            response = chat_with_claude(request.message, request.context)
            return ApiResponse(
                success=True,
                data={
                    "id": f"msg-{datetime.utcnow().timestamp()}",
                    "role": "assistant",
                    "content": response,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )
        except Exception as e:
            return ApiResponse(success=False, error=str(e))
    
    return ApiResponse(
        success=True,
        data={
            "id": f"msg-{datetime.utcnow().timestamp()}",
            "role": "assistant",
            "content": f"Demo response: You asked about '{request.message}'. In production, this would be answered by Claude AI.",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )

@app.get("/api/ai/alerts")
async def get_proactive_alerts():
    """Get AI-generated proactive alerts"""
    return ApiResponse(success=True, data=generate_demo_alerts())

# ============================================================
# Compliance Endpoints
# ============================================================

@app.get("/api/compliance/frameworks")
async def get_compliance_frameworks():
    """Get compliance frameworks"""
    return ApiResponse(success=True, data=generate_demo_frameworks())

@app.get("/api/compliance/score")
async def get_compliance_score():
    """Get overall compliance score"""
    return ApiResponse(success=True, data={"score": 87})

# ============================================================
# Guardrails Endpoints
# ============================================================

@app.get("/api/guardrails/scp")
async def get_scp_policies():
    """Get SCP policies"""
    return ApiResponse(success=True, data=generate_demo_scp_policies())

@app.get("/api/guardrails/opa")
async def get_opa_policies():
    """Get OPA policies"""
    return ApiResponse(success=True, data=generate_demo_opa_policies())

@app.get("/api/guardrails/kics")
async def get_kics_results():
    """Get KICS scanning results"""
    return ApiResponse(success=True, data=generate_demo_kics_results())

# ============================================================
# Account Lifecycle Endpoints
# ============================================================

@app.get("/api/accounts")
async def get_aws_accounts():
    """Get AWS accounts"""
    return ApiResponse(success=True, data=generate_demo_accounts())

@app.get("/api/accounts/templates")
async def get_account_templates():
    """Get account templates"""
    return ApiResponse(success=True, data=generate_demo_account_templates())

# ============================================================
# Demo Data Generators
# ============================================================

def generate_demo_dashboard_data():
    return {
        "keyMetrics": [
            {"id": "1", "title": "Total Findings", "value": 1247, "change": -12},
            {"id": "2", "title": "Critical Issues", "value": 23, "change": -3},
            {"id": "3", "title": "Compliance Score", "value": 87, "change": 5},
            {"id": "4", "title": "AWS Accounts", "value": 48, "change": 0},
            {"id": "5", "title": "MTD Cost", "value": 127400, "change": 8},
        ],
        "complianceScore": 87,
        "findings": {
            "critical": 23,
            "high": 89,
            "medium": 312,
            "low": 567,
            "informational": 256,
        },
    }

def generate_demo_security_hub_data():
    return {
        "critical": 23,
        "high": 89,
        "medium": 312,
        "low": 567,
        "informational": 256,
        "totalFindings": 1247,
        "complianceScore": 87,
        "enabledStandards": [
            "AWS Foundational Security Best Practices",
            "CIS AWS Foundations Benchmark",
            "PCI-DSS",
        ],
    }

def generate_demo_guardduty_data():
    return [
        {"id": "gd-001", "type": "Trojan:EC2/DriveBySourceTraffic!DNS", "severity": 8},
        {"id": "gd-002", "type": "Recon:EC2/PortProbeUnprotectedPort", "severity": 5},
    ]

def generate_demo_inspector_data():
    return [
        {"id": "ins-001", "title": "CVE-2024-1234", "severity": "HIGH", "cvss": 8.5},
        {"id": "ins-002", "title": "CVE-2024-5678", "severity": "MEDIUM", "cvss": 5.2},
    ]

def generate_demo_config_data():
    return {"compliant": 156, "nonCompliant": 23, "notApplicable": 12}

def generate_demo_cost_overview():
    return {
        "currentMonthCost": 127432,
        "previousMonthCost": 117500,
        "forecastedMonthCost": 185000,
        "monthOverMonthChange": 8.5,
        "yearToDateCost": 1247000,
        "budgetAmount": 200000,
        "budgetUsedPercent": 64,
    }

def generate_demo_service_costs():
    return [
        {"service": "Amazon EC2", "cost": 45000, "percentage": 35},
        {"service": "Amazon RDS", "cost": 28000, "percentage": 22},
        {"service": "Amazon S3", "cost": 18000, "percentage": 14},
    ]

def generate_demo_account_costs():
    return [
        {"accountId": "123456789012", "accountName": "Production-Retail", "cost": 65000},
        {"accountId": "123456789013", "accountName": "Dev-Healthcare", "cost": 28000},
    ]

def generate_demo_recommendations():
    return [
        {"type": "SAVINGS_PLAN", "title": "Compute Savings Plan", "monthlySavings": 12500},
        {"type": "RIGHTSIZING", "title": "EC2 Rightsizing", "monthlySavings": 4200},
    ]

def generate_demo_anomalies():
    return [
        {"service": "Amazon RDS", "impact": 2500, "impactPercentage": 47},
    ]

def generate_demo_budgets():
    return [
        {"name": "Overall AWS Budget", "amount": 200000, "spent": 127432, "percentUsed": 64},
    ]

def generate_demo_forecast():
    return {
        "nextMonth": 185000,
        "confidence": 85,
        "trend": "increasing",
    }

def generate_demo_predictions(type: Optional[str] = None):
    return [
        {"type": "cost", "title": "Monthly Cost Prediction", "prediction": "15% increase expected"},
        {"type": "security", "title": "Security Risk Forecast", "prediction": "Low risk of new critical findings"},
    ]

def generate_demo_alerts():
    return [
        {"id": "alert-001", "priority": "HIGH", "title": "Budget threshold approaching"},
        {"id": "alert-002", "priority": "MEDIUM", "title": "New critical CVE affecting your images"},
    ]

def generate_demo_frameworks():
    return [
        {"id": "aws-foundational", "name": "AWS Foundational", "score": 92},
        {"id": "cis-aws", "name": "CIS AWS Foundations", "score": 87},
        {"id": "pci-dss", "name": "PCI-DSS", "score": 78},
    ]

def generate_demo_scp_policies():
    return [
        {"id": "scp-001", "name": "Deny Root Account Actions", "status": "ATTACHED"},
        {"id": "scp-002", "name": "Require Encryption", "status": "ATTACHED"},
    ]

def generate_demo_opa_policies():
    return [
        {"id": "opa-001", "name": "Require Tags", "violations": 12},
        {"id": "opa-002", "name": "Block Privileged Containers", "violations": 3},
    ]

def generate_demo_kics_results():
    return {"totalIssues": 23, "critical": 2, "high": 8, "medium": 10, "low": 3}

def generate_demo_accounts():
    return [
        {"id": "123456789012", "name": "Production-Retail", "status": "ACTIVE"},
        {"id": "123456789013", "name": "Dev-Healthcare", "status": "ACTIVE"},
    ]

def generate_demo_account_templates():
    return [
        {"id": "tpl-001", "name": "Production Account", "environment": "production"},
        {"id": "tpl-002", "name": "Development Account", "environment": "development"},
    ]

# Helper functions
async def get_key_metrics():
    return generate_demo_dashboard_data()["keyMetrics"]

async def get_findings_summary():
    return generate_demo_dashboard_data()["findings"]

async def get_compliance_score():
    return 87

async def get_cost_overview():
    return generate_demo_cost_overview()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
