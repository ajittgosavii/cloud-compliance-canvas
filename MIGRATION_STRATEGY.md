# Cloud Compliance Canvas - Streamlit to React Migration Strategy

## 📋 Executive Summary

This document outlines the migration strategy for converting the **Cloud Compliance Canvas** enterprise platform from Streamlit (~14,000 lines) to a modern React-based architecture. The migration will result in a more performant, scalable, and maintainable application.

---

## 🏗️ Architecture Overview

### Current Architecture (Streamlit)
```
┌─────────────────────────────────────────────────────┐
│                    Streamlit App                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  UI + Business Logic + Data Fetching        │   │
│  │  (All in Python - 14,000+ lines)            │   │
│  └─────────────────────────────────────────────┘   │
│                        │                            │
│  ┌──────────┬─────────┬─────────┬─────────────┐   │
│  │  boto3   │ pandas  │ plotly  │  anthropic  │   │
│  └──────────┴─────────┴─────────┴─────────────┘   │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   AWS Services   │
              │   Claude AI API  │
              └──────────────────┘
```

### Target Architecture (React + FastAPI)
```
┌────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Components │ Hooks │ State Management │ Routing          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │   React Query  │  Zustand/Redux  │  Plotly.js │ Tailwind  │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                               │ REST/WebSocket
                               ▼
┌────────────────────────────────────────────────────────────────┐
│                   Backend API (FastAPI/Python)                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Endpoints │ Business Logic │ Data Processing            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌──────────┬───────────┬───────────┬─────────────────────┐   │
│  │  boto3   │  pandas   │ anthropic │  FastAPI + Pydantic │   │
│  └──────────┴───────────┴───────────┴─────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │   AWS Services   │
                    │   Claude AI API  │
                    └──────────────────┘
```

---

## 📊 Component Mapping

### Tab-to-Page Mapping

| Streamlit Tab | React Route | Priority | Complexity |
|---------------|-------------|----------|------------|
| AI Predictions | `/ai-predictions` | High | Complex |
| Dashboard | `/dashboard` | Critical | Medium |
| Compliance | `/compliance` | Critical | High |
| Vulnerabilities | `/vulnerabilities` | High | Medium |
| Guardrails | `/guardrails` | Medium | High |
| Remediation | `/remediation` | Medium | Very High |
| Accounts | `/accounts` | Medium | Medium |
| Security | `/security` | High | Medium |
| FinOps | `/finops` | Critical | High |
| Integrations | `/integrations` | Low | Medium |

### Key Module Migration

| Streamlit Module | React Component(s) | API Endpoints |
|------------------|-------------------|---------------|
| `streamlit_app.py` | `App.tsx`, `Layout.tsx`, All pages | - |
| `aws_finops_data.py` | `FinOpsDashboard.tsx` | `/api/finops/*` |
| `claude_predictions.py` | `AIPredictions.tsx` | `/api/ai/*` |
| `auth_azure_sso.py` | `AuthProvider.tsx` | `/api/auth/*` |
| `eks_vulnerability_*.py` | `VulnerabilityScanner.tsx` | `/api/vulnerabilities/*` |
| `batch_remediation_*.py` | `RemediationWorkflow.tsx` | `/api/remediation/*` |
| `tech_guardrails_*.py` | `GuardrailsManager.tsx` | `/api/guardrails/*` |

---

## 🔧 Technology Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite (faster than CRA)
- **Routing:** React Router v6
- **State Management:** Zustand (lightweight) or Redux Toolkit
- **Data Fetching:** TanStack Query (React Query)
- **Charts:** Plotly.js (same as Streamlit) or Recharts
- **UI Components:** Tailwind CSS + shadcn/ui
- **Authentication:** MSAL.js (Azure AD)
- **Real-time:** Socket.io (for live updates)

### Backend
- **Framework:** FastAPI (Python) - reuses existing boto3/pandas code
- **Authentication:** FastAPI-Azure-Auth
- **Documentation:** Auto-generated OpenAPI
- **Caching:** Redis for performance

---

## 📅 Migration Phases

### Phase 1: Foundation (Weeks 1-3)
- [ ] Set up React project with Vite + TypeScript
- [ ] Implement routing structure
- [ ] Create shared components (Layout, Sidebar, Header)
- [ ] Set up FastAPI backend with core endpoints
- [ ] Implement Azure AD authentication
- [ ] Create demo mode toggle

### Phase 2: Core Dashboards (Weeks 4-6)
- [ ] Executive Dashboard with KPIs
- [ ] Compliance Dashboard
- [ ] Security Findings Dashboard
- [ ] Basic chart components with Plotly

### Phase 3: FinOps (Weeks 7-8)
- [ ] Cost Overview Dashboard
- [ ] Budget Tracking
- [ ] Savings Recommendations
- [ ] Cost Anomaly Detection
- [ ] AI Cost Predictions

### Phase 4: Security & Compliance (Weeks 9-11)
- [ ] Vulnerability Scanner
- [ ] Security Hub Integration
- [ ] GuardDuty Findings
- [ ] Inspector Dashboard
- [ ] Compliance Framework Mapping

### Phase 5: Advanced Features (Weeks 12-14)
- [ ] Tech Guardrails (SCP, OPA, KICS)
- [ ] Policy as Code Platform
- [ ] Multi-Account Manager
- [ ] Account Lifecycle Management

### Phase 6: AI & Remediation (Weeks 15-17)
- [ ] AI Command Center
- [ ] Claude Chat Integration
- [ ] Automated Code Generation
- [ ] Batch Remediation Workflows
- [ ] Unified Remediation Dashboard

### Phase 7: Polish & Deploy (Weeks 18-20)
- [ ] Performance optimization
- [ ] Testing & QA
- [ ] Documentation
- [ ] Production deployment
- [ ] User training

---

## 🔄 Streamlit to React Patterns

### 1. State Management
```python
# Streamlit
st.session_state.demo_mode = True
if 'aws_connected' not in st.session_state:
    st.session_state.aws_connected = False
```

```typescript
// React with Zustand
const useAppStore = create((set) => ({
  demoMode: true,
  awsConnected: false,
  setDemoMode: (mode: boolean) => set({ demoMode: mode }),
  setAwsConnected: (connected: boolean) => set({ awsConnected: connected }),
}));
```

### 2. Tabs Navigation
```python
# Streamlit
tabs = st.tabs(["Dashboard", "Compliance", "FinOps"])
with tabs[0]:
    render_dashboard()
```

```tsx
// React with React Router
<Routes>
  <Route path="/" element={<Layout />}>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="compliance" element={<Compliance />} />
    <Route path="finops" element={<FinOps />} />
  </Route>
</Routes>
```

### 3. Data Fetching
```python
# Streamlit
def fetch_security_hub_findings(client):
    findings = client.get_findings(...)
    return findings
    
data = fetch_security_hub_findings(securityhub_client)
st.dataframe(pd.DataFrame(data))
```

```tsx
// React with React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['securityHubFindings'],
  queryFn: () => api.get('/security-hub/findings'),
});

return <DataTable data={data} loading={isLoading} />;
```

### 4. Charts
```python
# Streamlit + Plotly
fig = px.bar(df, x='category', y='count', color='severity')
st.plotly_chart(fig, use_container_width=True)
```

```tsx
// React + Plotly.js
import Plot from 'react-plotly.js';

<Plot
  data={[{
    type: 'bar',
    x: data.map(d => d.category),
    y: data.map(d => d.count),
    marker: { color: data.map(d => severityColors[d.severity]) }
  }]}
  layout={{ autosize: true }}
  useResizeHandler
  style={{ width: '100%' }}
/>
```

### 5. Conditional Rendering
```python
# Streamlit
if st.session_state.demo_mode:
    st.info("Demo Mode Active")
else:
    st.success("Live Mode - Connected to AWS")
```

```tsx
// React
{demoMode ? (
  <Alert variant="info">Demo Mode Active</Alert>
) : (
  <Alert variant="success">Live Mode - Connected to AWS</Alert>
)}
```

---

## 📁 Recommended Project Structure

```
react-finops-app/
├── src/
│   ├── components/
│   │   ├── common/           # Shared components
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   └── ChartWrapper.tsx
│   │   ├── dashboard/
│   │   ├── compliance/
│   │   ├── finops/
│   │   ├── security/
│   │   ├── guardrails/
│   │   ├── remediation/
│   │   ├── accounts/
│   │   ├── integrations/
│   │   └── ai/
│   ├── pages/                # Route pages
│   │   ├── DashboardPage.tsx
│   │   ├── CompliancePage.tsx
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useAWS.ts
│   │   └── useDemoMode.ts
│   ├── services/             # API client
│   │   ├── api.ts
│   │   ├── finopsService.ts
│   │   └── securityService.ts
│   ├── stores/               # State management
│   │   ├── appStore.ts
│   │   └── authStore.ts
│   ├── types/                # TypeScript types
│   │   ├── aws.ts
│   │   ├── finops.ts
│   │   └── security.ts
│   ├── utils/                # Utilities
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── api/                      # FastAPI backend
│   ├── main.py
│   ├── routers/
│   │   ├── finops.py
│   │   ├── security.py
│   │   └── ai.py
│   └── services/
│       └── aws_service.py
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## ⚡ Key Benefits of Migration

| Aspect | Streamlit | React |
|--------|-----------|-------|
| **Performance** | Full page rerenders | Virtual DOM, selective updates |
| **Scalability** | Single server | Horizontal scaling, CDN |
| **Offline Support** | None | PWA capabilities |
| **Mobile** | Limited | Responsive first |
| **Load Time** | Slow (Python + deps) | Fast (static bundle) |
| **SEO** | None | SSR/SSG possible |
| **Testing** | Limited | Jest, Cypress |
| **Component Reuse** | Functions | True components |

---

## 🚨 Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Learning curve | Start with familiar Plotly charts |
| Feature parity | Parallel run during migration |
| AWS integration | FastAPI backend reuses Python code |
| Authentication | MSAL.js for Azure AD |
| Demo mode | Implement mock service layer |

---

## 📞 Next Steps

1. **Review this strategy** and align on timeline
2. **Set up the React project** using the scaffold provided
3. **Create the FastAPI backend** to serve existing Python logic
4. **Migrate dashboard first** as proof of concept
5. **Iterate** through remaining modules

---

*Migration Strategy v1.0 | December 2025*
