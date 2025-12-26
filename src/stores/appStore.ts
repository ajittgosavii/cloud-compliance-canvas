import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, SecurityHubData, CostOverview } from '../types';

// ============================================================
// App Store - Global Application State
// ============================================================

interface AppState {
  // Mode & Connection
  demoMode: boolean;
  awsConnected: boolean;
  
  // Authentication
  authenticated: boolean;
  user: User | null;
  
  // Compliance Score
  overallComplianceScore: number;
  
  // Claude AI
  claudeApiKey: string | null;
  claudeConnected: boolean;
  
  // AWS Region
  currentRegion: string;
  
  // UI State
  sidebarCollapsed: boolean;
  activeTab: string;
  
  // Actions
  setDemoMode: (mode: boolean) => void;
  setAwsConnected: (connected: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setUser: (user: User | null) => void;
  setOverallComplianceScore: (score: number) => void;
  setClaudeApiKey: (key: string | null) => void;
  setClaudeConnected: (connected: boolean) => void;
  setCurrentRegion: (region: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tab: string) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial State
      demoMode: true, // Default to demo mode like Streamlit
      awsConnected: false,
      authenticated: false,
      user: null,
      overallComplianceScore: 0,
      claudeApiKey: null,
      claudeConnected: false,
      currentRegion: 'us-east-1',
      sidebarCollapsed: false,
      activeTab: 'dashboard',
      
      // Actions
      setDemoMode: (mode) => set({ demoMode: mode }),
      setAwsConnected: (connected) => set({ awsConnected: connected }),
      setAuthenticated: (authenticated) => set({ authenticated }),
      setUser: (user) => set({ user }),
      setOverallComplianceScore: (score) => set({ overallComplianceScore: score }),
      setClaudeApiKey: (key) => set({ claudeApiKey: key, claudeConnected: !!key }),
      setClaudeConnected: (connected) => set({ claudeConnected: connected }),
      setCurrentRegion: (region) => set({ currentRegion: region }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      logout: () => set({
        authenticated: false,
        user: null,
        awsConnected: false,
      }),
    }),
    {
      name: 'cloud-compliance-canvas-storage',
      partialize: (state) => ({
        demoMode: state.demoMode,
        currentRegion: state.currentRegion,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// ============================================================
// Security Store - Security & Compliance Data
// ============================================================

interface SecurityState {
  securityHubData: SecurityHubData | null;
  guardDutyFindings: any[];
  inspectorFindings: any[];
  configCompliance: any;
  loading: boolean;
  error: string | null;
  
  setSecurityHubData: (data: SecurityHubData | null) => void;
  setGuardDutyFindings: (findings: any[]) => void;
  setInspectorFindings: (findings: any[]) => void;
  setConfigCompliance: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSecurityStore = create<SecurityState>((set) => ({
  securityHubData: null,
  guardDutyFindings: [],
  inspectorFindings: [],
  configCompliance: null,
  loading: false,
  error: null,
  
  setSecurityHubData: (data) => set({ securityHubData: data }),
  setGuardDutyFindings: (findings) => set({ guardDutyFindings: findings }),
  setInspectorFindings: (findings) => set({ inspectorFindings: findings }),
  setConfigCompliance: (data) => set({ configCompliance: data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// ============================================================
// FinOps Store - Cost & Optimization Data
// ============================================================

interface FinOpsState {
  costOverview: CostOverview | null;
  budgets: any[];
  savingsRecommendations: any[];
  costAnomalies: any[];
  loading: boolean;
  error: string | null;
  dateRange: { start: string; end: string };
  
  setCostOverview: (data: CostOverview | null) => void;
  setBudgets: (budgets: any[]) => void;
  setSavingsRecommendations: (recommendations: any[]) => void;
  setCostAnomalies: (anomalies: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDateRange: (range: { start: string; end: string }) => void;
}

export const useFinOpsStore = create<FinOpsState>((set) => ({
  costOverview: null,
  budgets: [],
  savingsRecommendations: [],
  costAnomalies: [],
  loading: false,
  error: null,
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  },
  
  setCostOverview: (data) => set({ costOverview: data }),
  setBudgets: (budgets) => set({ budgets }),
  setSavingsRecommendations: (recommendations) => set({ savingsRecommendations: recommendations }),
  setCostAnomalies: (anomalies) => set({ costAnomalies: anomalies }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setDateRange: (range) => set({ dateRange: range }),
}));

// ============================================================
// AI Store - Predictions & Chat
// ============================================================

interface AIState {
  predictions: any[];
  chatHistory: any[];
  proactiveAlerts: any[];
  isGenerating: boolean;
  
  setPredictions: (predictions: any[]) => void;
  addChatMessage: (message: any) => void;
  clearChatHistory: () => void;
  setProactiveAlerts: (alerts: any[]) => void;
  setIsGenerating: (generating: boolean) => void;
}

export const useAIStore = create<AIState>((set) => ({
  predictions: [],
  chatHistory: [],
  proactiveAlerts: [],
  isGenerating: false,
  
  setPredictions: (predictions) => set({ predictions }),
  addChatMessage: (message) => set((state) => ({
    chatHistory: [...state.chatHistory, message],
  })),
  clearChatHistory: () => set({ chatHistory: [] }),
  setProactiveAlerts: (alerts) => set({ proactiveAlerts: alerts }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
}));
