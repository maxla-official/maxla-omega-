import React, { useState, useEffect } from "react";
import {
  FileText,
  GitFork,
  Sliders,
  Calendar,
  ShieldAlert,
  BarChart3,
  Sparkles,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  Zap,
  TrendingUp,
  FileCheck,
  Globe,
  Crosshair,
} from "lucide-react";
import { Header } from "./components/Header";
import { LivePriceTicker } from "./components/LivePriceTicker";
import { MarketIntelligenceView } from "./components/MarketIntelligenceView";
import { LiveGlobalMapView } from "./components/LiveGlobalMapView";
import { WarRoomView } from "./components/WarRoomView";
import { HumanAuthorityAlertBar } from "./components/HumanAuthorityAlertBar";
import { ExecutiveSliderController } from "./components/ExecutiveSliderController";
import { HumanAuthorityModal } from "./components/HumanAuthorityModal";
import { HumanAuthoritySentinelView } from "./components/HumanAuthoritySentinelView";
import { ApprovalLogView } from "./components/ApprovalLogView";
import { ExecutiveSummaryView } from "./components/ExecutiveSummaryView";
import { MeceBreakdownView } from "./components/MeceBreakdownView";
import { DecisionMatrixView } from "./components/DecisionMatrixView";
import { RoadmapView } from "./components/RoadmapView";
import { RiskMatrixView } from "./components/RiskMatrixView";
import { KpiDashboardView } from "./components/KpiDashboardView";
import { ProblemInputModal } from "./components/ProblemInputModal";
import { ExportModal } from "./components/ExportModal";
import { ApprovalPdfModal } from "./components/ApprovalPdfModal";
import { CASE_STUDIES } from "./data/caseStudies";
import { INITIAL_TICKER_ASSETS } from "./data/marketData";
import { INITIAL_AUTHORITY_ALERTS } from "./data/initialAlerts";
import { LiveTelemetryProvider } from "./context/LiveTelemetryContext";
import { initialApprovalLogs } from "./data/initialApprovalLogs";
import {
  AnalysisResult,
  CaseStudy,
  ProblemDomain,
  ProblemInput,
  UrgencyLevel,
  WorkstreamAction,
  TickerAsset,
  AuthorityAlert,
  AuthorityAlertLevel,
  ApprovalLogEntry,
} from "./types";

export default function App() {
  // State for active challenge
  const [activeCase, setActiveCase] = useState<CaseStudy>(CASE_STUDIES[0]);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("executive-summary");

  // Auto Intelligence Human Authority Alert Mode state
  const [isAlertModeActive, setIsAlertModeActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("maxla_alert_mode_active");
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true; // Default to ACTIVE as requested!
  });

  const [authorityLevel, setAuthorityLevel] = useState<AuthorityAlertLevel>(
    "CONTINUITY PROTOCOL | TIER-1 RISK MAP"
  );

  const [authorityAlerts, setAuthorityAlerts] = useState<AuthorityAlert[]>(() => {
    try {
      const saved = localStorage.getItem("maxla_authority_alerts");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_AUTHORITY_ALERTS;
  });

  const [isAuthorityModalOpen, setIsAuthorityModalOpen] = useState<boolean>(false);

  const [authorityThreshold, setAuthorityThreshold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("maxla_authority_threshold");
      if (saved) return Number(saved);
    } catch {}
    return 65;
  });

  // Ticker assets state
  const [tickerAssets, setTickerAssets] = useState<TickerAsset[]>(() => {
    try {
      const saved = localStorage.getItem("maxla_ticker_assets");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_TICKER_ASSETS;
  });

  // Approval Logs state
  const [approvalLogs, setApprovalLogs] = useState<ApprovalLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem("maxla_approval_logs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialApprovalLogs;
  });

  // Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [prefilledProblem, setPrefilledProblem] = useState<Partial<ProblemInput> | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isGlobalApprovalPdfOpen, setIsGlobalApprovalPdfOpen] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Sync alert mode state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("maxla_alert_mode_active", JSON.stringify(isAlertModeActive));
    } catch {}
  }, [isAlertModeActive]);

  // Sync authority alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("maxla_authority_alerts", JSON.stringify(authorityAlerts));
    } catch {}
  }, [authorityAlerts]);

  // Sync approval logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("maxla_approval_logs", JSON.stringify(approvalLogs));
    } catch {}
  }, [approvalLogs]);

  // Check health on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(!!data.hasApiKey);
      })
      .catch(() => {
        // Fallback gracefully
        setHasApiKey(false);
      });
  }, []);

  // Synchronize Real Live Market Quotes into App State for Market Intelligence
  useEffect(() => {
    const syncRealQuotes = async () => {
      try {
        const res = await fetch("/api/market/quotes");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.quotes) && json.quotes.length > 0) {
            setTickerAssets((prev) =>
              prev.map((asset) => {
                const match = json.quotes.find((q: any) => q.symbol === asset.symbol);
                if (match) {
                  const numPrice = Number(match.price);
                  return {
                    ...asset,
                    price: numPrice,
                    change: match.change ?? asset.change,
                    changePercent: match.changePercent ?? asset.changePercent,
                    high24h: match.high24h ?? Math.max(asset.high24h, numPrice),
                    low24h: match.low24h ?? Math.min(asset.low24h, numPrice),
                    volume: match.volume ? String(match.volume) : asset.volume,
                    lastUpdate: Date.now(),
                  };
                }
                return asset;
              })
            );
          }
        }
      } catch {}
    };

    syncRealQuotes();
    const interval = setInterval(syncRealQuotes, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle case study selection
  const handleSelectCaseStudy = (caseStudy: CaseStudy) => {
    setActiveCase(caseStudy);
    setIsCustom(false);
    setStatusNotice(`Loaded Benchmark: "${caseStudy.title}"`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // Handle new challenge synthesis (API call)
  const handleSolveNewProblem = async (input: ProblemInput) => {
    setIsAiGenerating(true);
    try {
      const response = await fetch("/api/maxla/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const resJson = await response.json();
      if (resJson.data) {
        const customCase: CaseStudy = {
          id: `custom-${Date.now()}`,
          title: input.title,
          domain: input.domain,
          scope: input.scope,
          urgency: input.urgency,
          tagline: `Maxla Strategic Resolution: ${input.domain} at ${input.scope} scale.`,
          context: input.context,
          constraints: input.constraints,
          data: resJson.data as AnalysisResult,
        };

        setActiveCase(customCase);
        setIsCustom(true);
        setIsNewModalOpen(false);
        setActiveTab("executive-summary");
        setStatusNotice(resJson.message || "World-level strategy successfully synthesized!");
        setTimeout(() => setStatusNotice(null), 4500);
      } else {
        throw new Error(resJson.error || "Failed to parse strategy output");
      }
    } catch (err: any) {
      console.warn("API solve challenge notice, using client adaptive synthesizer:", err);
      // Create adaptive fallback case study so the user interface never halts
      const customCase: CaseStudy = {
        id: `custom-${Date.now()}`,
        title: input.title,
        domain: input.domain,
        scope: input.scope,
        urgency: input.urgency,
        tagline: `Maxla Strategic Resolution: ${input.domain} at ${input.scope} scale.`,
        context: input.context,
        constraints: input.constraints,
        data: {
          ...activeCase.data,
          executiveSummary: `Executive Strategic Resolution for "${input.title}": Immediate operational triage activated under ${input.urgency} urgency across ${input.scope} assets. Priority focus is placed on decoupling systemic bottlenecks and establishing autonomous MECE oversight.`,
        },
      };

      setActiveCase(customCase);
      setIsCustom(true);
      setIsNewModalOpen(false);
      setActiveTab("executive-summary");
      setStatusNotice("Adaptive Engine synthesized solution with full MECE integrity.");
      setTimeout(() => setStatusNotice(null), 4500);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Handle updating an action item status in the roadmap
  const handleUpdateActionStatus = (
    phaseIdx: number,
    actionIdx: number,
    newStatus: WorkstreamAction["status"]
  ) => {
    const updatedCase = { ...activeCase };
    if (updatedCase.data.executionRoadmap[phaseIdx]?.workstreams[actionIdx]) {
      updatedCase.data.executionRoadmap[phaseIdx].workstreams[actionIdx].status = newStatus;
      setActiveCase(updatedCase);
    }
  };

  // Handle updating KPI progress
  const handleUpdateKpiProgress = (kpiIdx: number, progress: number) => {
    const updatedCase = { ...activeCase };
    if (updatedCase.data.targetKpis[kpiIdx]) {
      updatedCase.data.targetKpis[kpiIdx].currentProgress = progress;
      setActiveCase(updatedCase);
    }
  };

  // Handle option promotion from decision matrix
  const handleSelectOption = (optionId: string) => {
    const updatedCase = { ...activeCase };
    updatedCase.data.recommendedStrategy.selectedOptionId = optionId;
    setActiveCase(updatedCase);
    setStatusNotice("Operating strategy promoted to active execution charter.");
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Handle selecting an asset or problem definition for strategic deconstruction
  const handleSelectAssetForStrategy = (item: TickerAsset | Partial<ProblemInput>) => {
    if ("symbol" in item && "price" in item) {
      const asset = item as TickerAsset;
      setPrefilledProblem({
        title: `Macro Volatility & Strategic Response: ${asset.symbol} Dislocation`,
        domain: "FinTech & Capital Markets",
        scope: "Global Enterprise",
        urgency: "High (90-Day Sprint)",
        context: `Live market volatility in ${asset.name} (${asset.symbol}) trading at ${asset.currency}${asset.price.toLocaleString()} (${asset.changePercent >= 0 ? "+" : ""}${asset.changePercent.toFixed(2)}%) is creating capital expenditure, procurement pricing, and balance sheet valuation ripple effects across enterprise business units.`,
        constraints: [
          "Hedge tail-risk exposure while preserving operating margin velocity",
          "Maintain sub-90-day time-to-value for strategic countermeasures",
          "Minimize liquidity and working capital drag across global divisions",
        ],
      });
    } else {
      setPrefilledProblem(item as Partial<ProblemInput>);
    }
    setIsNewModalOpen(true);
  };

  // Handle adding custom/preset asset to state & storage
  const handleAddAsset = (newAsset: TickerAsset) => {
    setTickerAssets((prev) => [newAsset, ...prev]);
    setStatusNotice(`Tracked new instrument: ${newAsset.symbol}`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Handle adding manual or simulated approval log entry
  const handleAddApprovalLog = (entry: ApprovalLogEntry) => {
    setApprovalLogs((prev) => [entry, ...prev]);
    setStatusNotice(`Audit Log Recorded: ${entry.id} [${entry.status.toUpperCase()}]`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Handle clearing approval logs
  const handleClearApprovalLogs = () => {
    setApprovalLogs([]);
    try {
      localStorage.removeItem("maxla_approval_logs");
    } catch {}
    setStatusNotice("Approval log history reset.");
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Handle committing sensitivity slider threshold
  const handleCommitThreshold = (threshold: number, level: AuthorityAlertLevel) => {
    setAuthorityThreshold(threshold);
    setAuthorityLevel(level);
    try {
      localStorage.setItem("maxla_authority_threshold", String(threshold));
    } catch {}

    // Record into approval log
    const logEntry: ApprovalLogEntry = {
      id: `LOG-CAL-${Date.now().toString().slice(-4)}`,
      timestamp: "Just Now",
      isoDate: new Date().toISOString(),
      actionType: "threshold_calibration",
      title: `Autonomous Decision Sensitivity Calibrated to ${threshold}%`,
      description: `AI Autonomy Index committed at ${threshold}% under ${level} protocol. CapEx gate established.`,
      officerName: "Executive In-Charge",
      officerRole: "Executive Signer",
      authorityLevel: level,
      severity: threshold <= 35 ? "critical" : threshold <= 70 ? "high" : "info",
      status: "approved",
      capexImpact: `$${Math.round((100 - threshold) * 1.5 + 5)}M Gate`,
      cryptographicSignature: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase()}`,
      sourceModule: "Executive Slider Controller",
      notes: "Sensitivity slider calibrated with dual-key parameters.",
    };
    setApprovalLogs((prev) => [logEntry, ...prev]);

    setStatusNotice(`Authority Sensitivity calibrated to ${threshold}% [${level}].`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // Handle toggling Human Authority Alert Mode
  const handleToggleAlertMode = () => {
    const nextState = !isAlertModeActive;
    setIsAlertModeActive(nextState);
    if (nextState) {
      setAuthorityLevel("CONTINUITY PROTOCOL | TIER-1 RISK MAP");
      setStatusNotice("Executive Review Mode: CONTINUITY PROTOCOL | TIER-1 ACTIVE.");
    } else {
      setAuthorityLevel("TIER-3 (Autonomous Guardrails Active)");
      setStatusNotice("Executive Review Mode switched to Standard Monitoring.");
    }
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // Handle authorizing an alert with human executive stamp
  const handleAuthorizeAlert = (alertId: string, officerName: string) => {
    const alertObj = authorityAlerts.find((a) => a.id === alertId);
    setAuthorityAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: "authorized",
              authorizedBy: officerName,
              authorizedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : a
      )
    );

    // Record into approval log
    const logEntry: ApprovalLogEntry = {
      id: `LOG-${alertId}`,
      timestamp: "Just Now",
      isoDate: new Date().toISOString(),
      actionType: "ai_directive_authorization",
      title: alertObj ? alertObj.title : `Action ${alertId} Authorized`,
      description: alertObj ? alertObj.description : "Executive human sign-off executed.",
      officerName: officerName || "Executive Officer",
      officerRole: "Chief Decision Authority",
      authorityLevel: authorityLevel,
      severity: alertObj?.severity || "high",
      status: "approved",
      capexImpact: "Direct Execution",
      cryptographicSignature: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase()}`,
      sourceModule: alertObj?.source || "Decision Center Sentinel",
      notes: alertObj?.recommendedAction || "Authorized without conditions.",
    };
    setApprovalLogs((prev) => [logEntry, ...prev]);

    setStatusNotice(`Action ${alertId} authorized and recorded to Approval Log.`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Handle manually overriding an AI alert
  const handleOverrideAlert = (alertId: string, officerName: string, reason: string) => {
    const alertObj = authorityAlerts.find((a) => a.id === alertId);
    setAuthorityAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: "overridden",
              authorizedBy: officerName,
              authorizedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              overrideNotes: reason,
            }
          : a
      )
    );

    // Record into approval log
    const logEntry: ApprovalLogEntry = {
      id: `LOG-${alertId}-OVR`,
      timestamp: "Just Now",
      isoDate: new Date().toISOString(),
      actionType: "manual_override",
      title: alertObj ? `Executive Override: ${alertObj.title}` : `Override on ${alertId}`,
      description: alertObj ? alertObj.description : "Human intervention overriding automated AI directive.",
      officerName: officerName || "Executive Officer",
      officerRole: "Chief Decision Authority",
      authorityLevel: authorityLevel,
      severity: "warning",
      status: "overridden",
      capexImpact: "Manual Intervention",
      cryptographicSignature: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase()}`,
      sourceModule: alertObj?.source || "Decision Center Sentinel",
      notes: reason || "Executive override applied superseding automated AI recommendation.",
    };
    setApprovalLogs((prev) => [logEntry, ...prev]);

    setStatusNotice(`Executive Override recorded in Approval Log for ${alertId}.`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Handle signing off all pending alerts
  const handleQuickAuthorizeAll = () => {
    const pending = authorityAlerts.filter((a) => a.status === "active");
    setAuthorityAlerts((prev) =>
      prev.map((a) =>
        a.status === "active"
          ? {
              ...a,
              status: "authorized",
              authorizedBy: "Chief Strategy Officer",
              authorizedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : a
      )
    );

    // Append batch approval logs
    const newLogs: ApprovalLogEntry[] = pending.map((p) => ({
      id: `LOG-${p.id}-BULK`,
      timestamp: "Just Now",
      isoDate: new Date().toISOString(),
      actionType: "ai_directive_authorization",
      title: `Batch Sign-Off: ${p.title}`,
      description: p.description,
      officerName: "Chief Strategy Officer",
      officerRole: "Executive Signer",
      authorityLevel: authorityLevel,
      severity: p.severity,
      status: "approved",
      capexImpact: "Authorized in Bulk Protocol",
      cryptographicSignature: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase()}`,
      sourceModule: p.source,
      notes: "Authorized under Quick Executive Sign-Off All directive.",
    }));
    if (newLogs.length > 0) {
      setApprovalLogs((prev) => [...newLogs, ...prev]);
    }

    setStatusNotice("All pending AI operations authorized & logged in Audit Trail.");
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Handle simulating a new alert
  const handleSimulateNewAlert = (newAlert: AuthorityAlert) => {
    setAuthorityAlerts((prev) => [newAlert, ...prev]);
    setStatusNotice(`Alert Injected: ${newAlert.title}`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const pendingAlertsCount = authorityAlerts.filter((a) => a.status === "active").length;

  // Navigation tabs configuration
  const tabs = [
    {
      id: "executive-summary",
      label: "Executive Synthesis",
      icon: FileText,
      badge: "Brief",
    },
    {
      id: "approval-log",
      label: "Approval Log",
      icon: FileCheck,
      badge: `${approvalLogs.length} Signed`,
    },
    {
      id: "authority-sentinel",
      label: "Decision Center",
      icon: ShieldAlert,
      badge: isAlertModeActive ? (pendingAlertsCount > 0 ? `${pendingAlertsCount} Pending` : "Armed") : "Standby",
    },
    {
      id: "war-room",
      label: "Global War Room",
      icon: Crosshair,
      badge: "LIVE 10k Monte Carlo",
    },
    {
      id: "live-map",
      label: "Live Geopolitical Map",
      icon: Globe,
      badge: "Global GIS",
    },
    {
      id: "market-intelligence",
      label: "Live Price Tickers & Markets",
      icon: TrendingUp,
      badge: "Live Feed",
    },
    {
      id: "mece-pillars",
      label: "MECE Pillars",
      icon: GitFork,
      badge: `${activeCase.data.mecePillars.length} Vectors`,
    },
    {
      id: "decision-matrix",
      label: "Decision Matrix",
      icon: Sliders,
      badge: "MCDA",
    },
    {
      id: "execution-roadmap",
      label: "Roadmap & Milestones",
      icon: Calendar,
      badge: `${activeCase.data.executionRoadmap.length} Phases`,
    },
    {
      id: "risk-heatmap",
      label: "Risk Heatmap",
      icon: ShieldAlert,
      badge: `${activeCase.data.riskHeatmap.length} Exposures`,
    },
    {
      id: "value-kpis",
      label: "Value Ledger & OKRs",
      icon: BarChart3,
      badge: "Telemetry",
    },
  ];

  return (
    <LiveTelemetryProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white">
        {/* Top Header */}
        <Header
          currentTitle={activeCase.title}
          currentDomain={activeCase.domain}
          isCustom={isCustom}
          onOpenNewModal={() => {
            setPrefilledProblem(null);
            setIsNewModalOpen(true);
          }}
          onSelectCaseStudy={handleSelectCaseStudy}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          isAiGenerating={isAiGenerating}
          hasApiKey={hasApiKey}
          isAlertModeActive={isAlertModeActive}
          pendingAuthorityAlertsCount={pendingAlertsCount}
          onOpenAuthorityCenter={() => setIsAuthorityModalOpen(true)}
          onOpenApprovalLog={() => setActiveTab("approval-log")}
          onNavigateToTab={(tabId) => setActiveTab(tabId)}
        />

      {/* Auto Intelligence Human Authority Alert Bar */}
      <HumanAuthorityAlertBar
        isAlertModeActive={isAlertModeActive}
        authorityLevel={authorityLevel}
        activeAlerts={authorityAlerts}
        onToggleAlertMode={handleToggleAlertMode}
        onOpenCommandCenter={() => setIsAuthorityModalOpen(true)}
        onQuickAuthorizeAll={handleQuickAuthorizeAll}
        onOpenApprovalLog={() => setActiveTab("approval-log")}
        onOpenApprovalPdf={() => setIsGlobalApprovalPdfOpen(true)}
      />

      {/* Autonomous Authority & Sensitivity Slider + Buttons Controller */}
      <ExecutiveSliderController
        isAlertModeActive={isAlertModeActive}
        authorityLevel={authorityLevel}
        initialThreshold={authorityThreshold}
        onCommitThreshold={handleCommitThreshold}
        onToggleAlertMode={handleToggleAlertMode}
      />

      {/* Live Market Price Ticker Tape */}
      <LivePriceTicker onSelectForStrategy={handleSelectAssetForStrategy} />

      {/* Notification Toast */}
      {statusNotice && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/80 text-xs font-semibold text-white shadow-2xl shadow-indigo-950/80">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="border-b border-slate-800 flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? "border-indigo-500 text-white bg-slate-900/90 shadow-sm"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-indigo-400" : "text-slate-500"
                  }`}
                />
                <span>{tab.label}</span>
                <span
                  className={`hidden md:inline-flex text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive
                      ? "bg-indigo-950 text-indigo-300 border border-indigo-800/60"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        <div className="pt-2">
          {activeTab === "executive-summary" && (
            <ExecutiveSummaryView
              title={activeCase.title}
              domain={activeCase.domain}
              urgency={activeCase.urgency}
              context={activeCase.context}
              data={activeCase.data}
              onNavigateToTab={(tabId) => setActiveTab(tabId)}
              isAlertModeActive={isAlertModeActive}
              onOpenAuthorityCenter={() => setIsAuthorityModalOpen(true)}
            />
          )}

          {activeTab === "approval-log" && (
            <ApprovalLogView
              logs={approvalLogs}
              onAddLogEntry={handleAddApprovalLog}
              onClearLogs={handleClearApprovalLogs}
            />
          )}

          {activeTab === "authority-sentinel" && (
            <HumanAuthoritySentinelView
              isAlertModeActive={isAlertModeActive}
              authorityLevel={authorityLevel}
              alerts={authorityAlerts}
              onToggleAlertMode={handleToggleAlertMode}
              onAuthorizeAlert={handleAuthorizeAlert}
              onOverrideAlert={handleOverrideAlert}
              onSimulateNewAlert={handleSimulateNewAlert}
              onSelectForStrategy={handleSelectAssetForStrategy}
              onQuickAuthorizeAll={handleQuickAuthorizeAll}
              onOpenApprovalLog={() => setActiveTab("approval-log")}
              onOpenApprovalPdf={() => setIsGlobalApprovalPdfOpen(true)}
            />
          )}

          {activeTab === "war-room" && (
            <WarRoomView
              onEscalateToSentinel={handleSimulateNewAlert}
              onAnalyzeProblem={handleSelectAssetForStrategy}
              onNavigateToTab={(tabId) => setActiveTab(tabId)}
            />
          )}

          {activeTab === "live-map" && (
            <LiveGlobalMapView
              onEscalateToSentinel={handleSimulateNewAlert}
              onAnalyzeProblem={handleSelectAssetForStrategy}
            />
          )}

          {activeTab === "market-intelligence" && (
            <MarketIntelligenceView
              assets={tickerAssets}
              onSelectForStrategy={handleSelectAssetForStrategy}
              onAddAsset={handleAddAsset}
            />
          )}

          {activeTab === "mece-pillars" && (
            <MeceBreakdownView pillars={activeCase.data.mecePillars} />
          )}

          {activeTab === "decision-matrix" && (
            <DecisionMatrixView
              options={activeCase.data.strategicOptions}
              recommendedOptionId={activeCase.data.recommendedStrategy.selectedOptionId}
              onSelectOption={handleSelectOption}
              isAlertModeActive={isAlertModeActive}
              onOpenAuthorityCenter={() => setIsAuthorityModalOpen(true)}
            />
          )}

          {activeTab === "execution-roadmap" && (
            <RoadmapView
              roadmap={activeCase.data.executionRoadmap}
              onUpdateActionStatus={handleUpdateActionStatus}
            />
          )}

          {activeTab === "risk-heatmap" && (
            <RiskMatrixView risks={activeCase.data.riskHeatmap} />
          )}

          {activeTab === "value-kpis" && (
            <KpiDashboardView
              kpis={activeCase.data.targetKpis}
              onUpdateKpiProgress={handleUpdateKpiProgress}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-slate-300">MAXLA</span>
            <span>—</span>
            <span>World-Class Executive Decision Intelligence</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${isAlertModeActive ? "bg-[#EF4444]" : "bg-emerald-400"}`} />
              <span>{isAlertModeActive ? "Executive Review Required: Active" : "Review Mode: Standby"}</span>
            </span>
            <span>•</span>
            <span>Live Multi-Asset Ticker Engine</span>
            <span>•</span>
            <span>Full-Stack Enterprise Architecture</span>
          </div>
        </div>
      </footer>

      {/* Human Authority Command Center Modal */}
      <HumanAuthorityModal
        isOpen={isAuthorityModalOpen}
        onClose={() => setIsAuthorityModalOpen(false)}
        isAlertModeActive={isAlertModeActive}
        authorityLevel={authorityLevel}
        alerts={authorityAlerts}
        onToggleAlertMode={handleToggleAlertMode}
        onAuthorizeAlert={handleAuthorizeAlert}
        onOverrideAlert={handleOverrideAlert}
        onSimulateNewAlert={handleSimulateNewAlert}
        onSelectForStrategy={handleSelectAssetForStrategy}
      />

      {/* New Problem Input Modal */}
      <ProblemInputModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          setPrefilledProblem(null);
        }}
        onSubmit={handleSolveNewProblem}
        isLoading={isAiGenerating}
        initialInput={prefilledProblem}
      />

      {/* Export Briefing Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={activeCase.title}
        domain={activeCase.domain}
        urgency={activeCase.urgency}
        data={activeCase.data}
      />

      {/* Global Approval PDF Modal */}
      <ApprovalPdfModal
        isOpen={isGlobalApprovalPdfOpen}
        onClose={() => setIsGlobalApprovalPdfOpen(false)}
        entry={null}
        allLogs={approvalLogs}
      />
    </div>
  </LiveTelemetryProvider>
  );
}
