import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  RotateCcw,
  Zap,
  Key,
  UserCheck,
  Sliders,
  FileCheck,
  Terminal,
  Printer,
} from "lucide-react";
import { AuthorityAlert, AuthorityAlertLevel, ProblemInput } from "../types";

interface HumanAuthoritySentinelViewProps {
  isAlertModeActive: boolean;
  authorityLevel: AuthorityAlertLevel;
  alerts: AuthorityAlert[];
  onToggleAlertMode: () => void;
  onAuthorizeAlert: (alertId: string, officerName: string) => void;
  onOverrideAlert: (alertId: string, officerName: string, reason: string) => void;
  onSimulateNewAlert: (alert: AuthorityAlert) => void;
  onSelectForStrategy?: (problem: Partial<ProblemInput>) => void;
  onQuickAuthorizeAll?: () => void;
  onOpenApprovalLog?: () => void;
  onOpenApprovalPdf?: () => void;
}

export const HumanAuthoritySentinelView: React.FC<HumanAuthoritySentinelViewProps> = ({
  isAlertModeActive,
  authorityLevel,
  alerts,
  onToggleAlertMode,
  onAuthorizeAlert,
  onOverrideAlert,
  onSimulateNewAlert,
  onSelectForStrategy,
  onQuickAuthorizeAll,
  onOpenApprovalLog,
  onOpenApprovalPdf,
}) => {
  const [officerName, setOfficerName] = useState("Chief Strategy Officer");
  const [overrideInput, setOverrideInput] = useState<{ [id: string]: string }>({});
  const [activeOverrideId, setActiveOverrideId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<"all" | "critical" | "high" | "warning">("all");

  const pendingAlerts = alerts.filter(
    (a) => a.status === "active" && (filterSeverity === "all" || a.severity === filterSeverity)
  );
  const totalPending = alerts.filter((a) => a.status === "active").length;
  const criticalPending = alerts.filter((a) => a.status === "active" && a.severity === "critical").length;
  const resolvedAlerts = alerts.filter((a) => a.status !== "active");

  const handleAuthorize = (id: string) => {
    onAuthorizeAlert(id, officerName);
  };

  const handleOverrideSubmit = (id: string) => {
    const reason = overrideInput[id] || "Executive manual override superseding automated AI directive.";
    onOverrideAlert(id, officerName, reason);
    setActiveOverrideId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Protocol Status Banner */}
      <div
        className="rounded-2xl border p-6 transition-all bg-slate-900 border-slate-800"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-slate-950 border-slate-700 text-slate-200"
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isAlertModeActive ? "bg-[#EF4444]" : "bg-slate-600"
                    }`}
                  />
                </span>
                <span>{isAlertModeActive ? "Executive Review Required" : "Executive Review Protocol: STANDBY"}</span>
              </span>

              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-950 text-slate-300 border border-slate-700">
                {authorityLevel}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Executive Decision Center & Governance Controls
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              When Review Mode is active, Maxla enforces mandatory dual executive sign-off for critical supply chain decisions, semiconductor capital commitments, and continuous risk mitigation workflows.
            </p>
          </div>

          {/* Quick Metrics & Controls */}
          <div className="flex flex-wrap lg:flex-col gap-3 shrink-0">
            <button
              onClick={onToggleAlertMode}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition shadow-sm ${
                isAlertModeActive
                  ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700"
              }`}
            >
              <Zap className="w-4 h-4 text-slate-300" />
              <span>{isAlertModeActive ? "Deactivate Review Mode" : "Activate Review Mode"}</span>
            </button>

            {totalPending > 0 && onQuickAuthorizeAll && (
              <button
                onClick={onQuickAuthorizeAll}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Executive Sign-Off All ({totalPending})</span>
              </button>
            )}

            {onOpenApprovalLog && (
              <button
                id="sentinel-open-approval-log-btn"
                onClick={onOpenApprovalLog}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                title="View Cryptographic Approval Log and Audit Ledger"
              >
                <FileCheck className="w-4 h-4 text-slate-300" />
                <span>Approval Log</span>
              </button>
            )}

            {onOpenApprovalPdf && (
              <button
                id="sentinel-open-approval-pdf-btn"
                onClick={onOpenApprovalPdf}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700 shadow-sm active:scale-95"
                title="Print or Export Approval Audit Trail as PDF"
              >
                <Printer className="w-4 h-4 text-slate-300" />
                <span>Approval PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Active Executive Signer</span>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs w-full focus:outline-none focus:border-slate-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Pending Reviews</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold font-mono text-white">{totalPending}</span>
              {criticalPending > 0 && (
                <span className="text-[10px] font-bold text-[#EF4444] font-mono">
                  ({criticalPending} Critical)
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Governance Protocol</span>
            <span className="mt-1 block font-mono font-bold text-slate-200">Dual Approval Workflow Active</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Audited Decisions</span>
            <span className="mt-1 block font-mono font-bold text-slate-200">{resolvedAlerts.length} Executed</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Queue & Incident Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pending Decisions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-slate-300" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Pending Executive Review Queue
              </h3>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
              {(["all", "critical", "high", "warning"] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded font-semibold capitalize transition ${
                    filterSeverity === sev
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {pendingAlerts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-sm">All Automated Decisions Authorized</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active actions require human sign-off under the current severity filter. You can inject a simulated trigger on the right to test escalation workflows.
              </p>
            </div>
          ) : (
            pendingAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all ${
                  alert.severity === "critical"
                    ? "bg-slate-900/90 border-red-700/80 shadow-lg shadow-red-950/30"
                    : "bg-slate-900/80 border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          alert.severity === "critical"
                            ? "bg-red-900/60 text-red-300 border border-red-700/60"
                            : "bg-amber-900/60 text-amber-300 border border-amber-700/60"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{alert.id}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{alert.timestamp}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{alert.source}</span>
                    </div>

                    <h4 className="text-base font-bold text-white tracking-tight">{alert.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>
                  </div>

                  {alert.requiresDualKey && (
                    <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-medium">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dual Approval Workflow Active</span>
                    </div>
                  )}
                </div>

                {/* Proposed Action Box */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-300">Automated Intelligence Recommendation: </span>
                  <span className="text-slate-300">{alert.recommendedAction}</span>
                </div>

                {/* Override Input Box if active */}
                {activeOverrideId === alert.id && (
                  <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-800/80 space-y-2">
                    <label className="text-xs font-bold text-red-300">
                      Executive Manual Override Directive:
                    </label>
                    <input
                      type="text"
                      placeholder="Specify the executive override instruction to replace AI output..."
                      value={overrideInput[alert.id] || ""}
                      onChange={(e) =>
                        setOverrideInput({ ...overrideInput, [alert.id]: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-red-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setActiveOverrideId(null)}
                        className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleOverrideSubmit(alert.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold"
                      >
                        Confirm Executive Override
                      </button>
                    </div>
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Key className="w-3 h-3 text-slate-400" />
                    <span>Cryptographic audit entry will be signed by {officerName}.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onSelectForStrategy && (
                      <button
                        onClick={() => {
                          onSelectForStrategy({
                            title: alert.title,
                            domain: "Crisis & Incident Escalation",
                            scope: "Global Enterprise",
                            urgency: "Critical (Immediate Triage)",
                            context: alert.description,
                            constraints: [
                              "Require dual-key executive sign-off before operational execution",
                              "Maintain zero interruption to mission-critical core systems",
                            ],
                          });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-medium transition"
                      >
                        <span>Deconstruct in Maxla</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => setActiveOverrideId(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                    >
                      Executive Override
                    </button>

                    <button
                      onClick={() => handleAuthorize(alert.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Authorize & Execute</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right 1 Col: Trigger Injection & Audit Stream */}
        <div className="space-y-6">
          {/* Quick Simulation Box */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Trigger Escalation Injection
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inject synthetic black-swan anomalies to stress-test human-in-the-loop executive sign-off controls.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  onSimulateNewAlert({
                    id: `SEMI-${Math.floor(1000 + Math.random() * 9000)}`,
                    timestamp: "Just Now",
                    title: "SEMICON India Corridor: Sanand ATMP Lead-Time & Bengaluru EDA Bottleneck",
                    severity: "critical",
                    source: "SEMICON India Supply Chain Correlation Engine",
                    description: "Bengaluru 3nm EDA tape-out variance correlated with Sanand ATMP ABF substrate delivery lag (+18 days). Mysuru compound fab buffer required.",
                    recommendedAction: "Authorize $18.5M dual-source air charter bridge and calibrate tapeout synchronization milestone.",
                    requiresDualKey: true,
                    status: "active",
                  });
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-1 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white group-hover:text-slate-200">
                    SEMICON India Corridor Bottleneck
                  </span>
                  <span className="text-[10px] font-mono text-[#EF4444] bg-slate-900 border border-slate-700 px-1.5 py-0.2 rounded">
                    Critical
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Bengaluru-Sanand-Mysuru correlation trigger ($18.5M).</p>
              </button>

              <button
                onClick={() => {
                  onSimulateNewAlert({
                    id: `AUTH-${Math.floor(1000 + Math.random() * 9000)}`,
                    timestamp: "Just Now",
                    title: "Treasury Sovereign Rate Volatility Lock",
                    severity: "critical",
                    source: "Auto-Intelligence Sentinel Engine",
                    description: "Intraday US10Y variance exceeded 32 bps threshold. Automated liquidity preservation lock engaged.",
                    recommendedAction: "Mandatory human C-Suite authorization required to unlock and reallocate capital.",
                    requiresDualKey: true,
                    status: "active",
                  });
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-1 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white group-hover:text-slate-200">
                    Sovereign Rate Dislocation
                  </span>
                  <span className="text-[10px] font-mono text-[#EF4444] bg-slate-900 border border-slate-700 px-1.5 py-0.2 rounded">
                    Critical
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Lock $180M liquidity allocation.</p>
              </button>

              <button
                onClick={() => {
                  onSimulateNewAlert({
                    id: `AUTH-${Math.floor(1000 + Math.random() * 9000)}`,
                    timestamp: "Just Now",
                    title: "Synthetic Equity Stake Defense Trigger",
                    severity: "critical",
                    source: "Maxla Strategic Threat Sentinel",
                    description: "AI pattern recognition detected rapid swap-based accumulation totaling 9.4% voting rights.",
                    recommendedAction: "Executive authorization needed to activate shareholder poison-pill rights defense.",
                    requiresDualKey: true,
                    status: "active",
                  });
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-red-600/70 transition space-y-1 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white group-hover:text-red-300">
                    Hostile Takeover AI Alarm
                  </span>
                  <span className="text-[10px] font-mono text-red-400 bg-red-950 px-1.5 py-0.2 rounded">
                    Critical
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Prime poison pill rights threshold.</p>
              </button>

              <button
                onClick={() => {
                  onSimulateNewAlert({
                    id: `AUTH-${Math.floor(1000 + Math.random() * 9000)}`,
                    timestamp: "Just Now",
                    title: "Automated Air-Freight Diversion Mandate",
                    severity: "high",
                    source: "MECE Global Supply Chain Sentinel",
                    description: "Strait of Malacca maritime transit risk spiked to 78%. AI recommends immediate air cargo charter.",
                    recommendedAction: "Human sign-off needed to commit $14.2M supplementary logistics Capex.",
                    requiresDualKey: false,
                    status: "active",
                  });
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-600/70 transition space-y-1 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white group-hover:text-amber-300">
                    Maritime Supply Embargo
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-1.5 py-0.2 rounded">
                    High
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Reroute component supply via air.</p>
              </button>
            </div>
          </div>

          {/* Immutable Executive Audit Log */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Audit Trail
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {resolvedAlerts.length} Recorded
              </span>
            </div>

            {resolvedAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No sign-off actions logged in this session yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {resolvedAlerts.map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                          a.status === "authorized"
                            ? "bg-emerald-950 text-emerald-400"
                            : "bg-red-950 text-red-400"
                        }`}
                      >
                        {a.status.toUpperCase()}
                      </span>
                      <span className="text-slate-500 font-mono">{a.authorizedAt}</span>
                    </div>
                    <p className="text-slate-300 font-medium line-clamp-1">{a.title}</p>
                    <p className="text-slate-500">Signer: {a.authorizedBy || "CSO"}</p>
                    {a.overrideNotes && (
                      <p className="text-amber-300 font-mono text-[10px]">
                        Note: {a.overrideNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {onOpenApprovalLog && (
              <button
                id="sentinel-audit-card-approval-log-btn"
                onClick={onOpenApprovalLog}
                className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-300 text-xs font-semibold transition"
              >
                <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Open Full Cryptographic Approval Log</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
