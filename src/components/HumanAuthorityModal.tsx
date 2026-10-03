import React, { useState } from "react";
import {
  X,
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
  Send,
  Sliders
} from "lucide-react";
import { AuthorityAlert, AuthorityAlertLevel, ProblemInput } from "../types";

interface HumanAuthorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAlertModeActive: boolean;
  authorityLevel: AuthorityAlertLevel;
  alerts: AuthorityAlert[];
  onToggleAlertMode: () => void;
  onAuthorizeAlert: (alertId: string, officerName: string) => void;
  onOverrideAlert: (alertId: string, officerName: string, reason: string) => void;
  onSimulateNewAlert: (alert: AuthorityAlert) => void;
  onSelectForStrategy?: (problem: Partial<ProblemInput>) => void;
}

export const HumanAuthorityModal: React.FC<HumanAuthorityModalProps> = ({
  isOpen,
  onClose,
  isAlertModeActive,
  authorityLevel,
  alerts,
  onToggleAlertMode,
  onAuthorizeAlert,
  onOverrideAlert,
  onSimulateNewAlert,
  onSelectForStrategy,
}) => {
  const [activeTab, setActiveTab] = useState<"pending" | "audit" | "simulate">("pending");
  const [officerName, setOfficerName] = useState("Chief Strategy Officer");
  const [overrideInput, setOverrideInput] = useState<{ [id: string]: string }>({});
  const [activeOverrideId, setActiveOverrideId] = useState<string | null>(null);

  if (!isOpen) return null;

  const pendingAlerts = alerts.filter((a) => a.status === "active");
  const resolvedAlerts = alerts.filter((a) => a.status !== "active");

  const handleAuthorize = (id: string) => {
    onAuthorizeAlert(id, officerName);
  };

  const handleOverrideSubmit = (id: string) => {
    const reason = overrideInput[id] || "Executive manual directive superseding automated AI recommendation.";
    onOverrideAlert(id, officerName, reason);
    setActiveOverrideId(null);
  };

  const triggerPresetAlert = (type: "semicon" | "liquidity" | "hostile" | "cyber") => {
    let newAlert: AuthorityAlert;
    if (type === "semicon") {
      newAlert = {
        id: `SEMI-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: "Just Now",
        title: "SEMICON India Corridor: Sanand ATMP Lead-Time & Bengaluru EDA Bottleneck",
        severity: "critical",
        source: "SEMICON India Supply Chain Correlation Engine",
        description: "Bengaluru 3nm EDA tape-out variance correlated with Sanand ATMP ABF substrate delivery lag (+18 days). Mysuru compound fab buffer required.",
        recommendedAction: "Authorize $18.5M dual-source air charter bridge and calibrate tapeout synchronization milestone.",
        requiresDualKey: true,
        status: "active",
      };
    } else if (type === "liquidity") {
      newAlert = {
        id: `AUTH-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: "Just Now",
        title: "Autonomous Treasury Liquidity Lock Triggered",
        severity: "critical",
        source: "Auto-Intelligence Sentinel Engine",
        description: "Intraday sovereign rate volatility exceeded 4.5% variance threshold. AI system generated an automated liquidity preservation lock on $250M working capital.",
        recommendedAction: "Mandatory human executive authorization required to release operational liquidity.",
        requiresDualKey: true,
        status: "active",
      };
    } else if (type === "hostile") {
      newAlert = {
        id: `AUTH-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: "Just Now",
        title: "Hostile Stake Accumulation & Shareholder Rights Plan",
        severity: "critical",
        source: "Maxla Strategic Threat Sentinel",
        description: "AI pattern recognition identified rapid creeping ownership spike by synthetic equity swaps totaling 9.4% voting rights. Autonomous poison-pill defense primed.",
        recommendedAction: "Executive human authorization required to enact shareholder rights poison-pill threshold.",
        requiresDualKey: true,
        status: "active",
      };
    } else {
      newAlert = {
        id: `AUTH-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: "Just Now",
        title: "Automated Supply Line Reroute & Vendor Disqualification",
        severity: "high",
        source: "MECE Global Supply Chain Sentinel",
        description: "Primary maritime logistics partner flagged for critical customs embargo risk. AI proposes immediate termination of shipping contracts and diversion to air cargo.",
        recommendedAction: "Executive approval needed to incur additional freight surcharge of $8.5M.",
        requiresDualKey: false,
        status: "active",
      };
    }

    onSimulateNewAlert(newAlert);
    setActiveTab("pending");
  };

  return (
    <div
      id="human-authority-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="human-authority-modal-card"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              <ShieldAlert className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Decision Center & Governance Console
                </h3>
                <span
                  className="px-2 py-0.5 text-xs font-bold uppercase rounded-md border bg-slate-900 border-slate-700 text-slate-200"
                >
                  {isAlertModeActive ? "EXECUTIVE REVIEW REQUIRED" : "STANDBY"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                SEMICON India Supply Chain Governance, Continuity Protocol & Dual Approval Workflows
              </p>
            </div>
          </div>

          <button
            id="close-authority-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Authority Banner & Mode Controls */}
        <div className="px-6 py-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>Executive Signer:</span>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-white font-mono text-xs focus:outline-none focus:border-slate-500"
              />
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Protocol:</span>
              <span className="font-mono text-slate-200 font-bold">Dual Approval Workflow Active</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="modal-toggle-alert-mode-btn"
              onClick={onToggleAlertMode}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                isAlertModeActive
                  ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {isAlertModeActive ? "Set to Standby" : "Engage Review Mode"}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-4">
          <button
            id="tab-pending-authority"
            onClick={() => setActiveTab("pending")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === "pending"
                ? "border-red-500 text-red-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Pending AI Authorizations</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-950 text-red-300 border border-red-800/60 font-mono">
              {pendingAlerts.length}
            </span>
          </button>

          <button
            id="tab-audit-trail"
            onClick={() => setActiveTab("audit")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === "audit"
                ? "border-red-500 text-red-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Executive Audit Trail</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-400 font-mono">
              {resolvedAlerts.length}
            </span>
          </button>

          <button
            id="tab-simulate-alerts"
            onClick={() => setActiveTab("simulate")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "simulate"
                ? "border-red-500 text-red-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate High-Stakes Trigger</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
          {activeTab === "pending" && (
            <div className="space-y-4">
              {pendingAlerts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
                  <p className="font-semibold text-white">All Automated Intelligence Actions Cleared</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    No autonomous recommendations currently pending human authorization. The auto-intelligence sentinel engine is continuously running with full human authority guardrails.
                  </p>
                </div>
              ) : (
                pendingAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    id={`alert-card-${alert.id}`}
                    className={`p-4 rounded-xl border transition-all ${
                      alert.severity === "critical"
                        ? "bg-red-950/20 border-red-800/80"
                        : "bg-slate-950/60 border-slate-800"
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

                        <h4 className="text-base font-bold text-white">{alert.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>
                      </div>

                      {alert.requiresDualKey && (
                        <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-medium">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Dual Approval Workflow Active</span>
                        </div>
                      )}
                    </div>

                    {/* Proposed Action */}
                    <div className="mt-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                      <span className="font-semibold text-slate-300">Automated Intelligence Recommendation: </span>
                      <span className="text-slate-200">{alert.recommendedAction}</span>
                    </div>

                    {/* Override Input Field if active */}
                    {activeOverrideId === alert.id && (
                      <div className="mt-3 p-3 rounded-lg bg-red-950/40 border border-red-800/80 space-y-2">
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

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80">
                      <div className="text-[11px] text-slate-500">
                        Sign-off will be logged to immutable executive ledger.
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
                              onClose();
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
                          Manual Override
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
          )}

          {activeTab === "audit" && (
            <div className="space-y-3">
              {resolvedAlerts.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  No previous authorizations or overrides recorded in this session.
                </div>
              ) : (
                resolvedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                            alert.status === "authorized"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-red-950 text-red-400 border border-red-800"
                          }`}
                        >
                          {alert.status === "authorized" ? "AUTHORIZED" : "OVERRIDDEN"}
                        </span>
                        <span className="font-bold text-white">{alert.title}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">{alert.description}</p>
                      {alert.overrideNotes && (
                        <p className="text-amber-300 text-[11px] mt-1 font-mono">
                          Override Directive: &quot;{alert.overrideNotes}&quot;
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0 text-[11px] text-slate-400 font-mono">
                      <div>Signer: {alert.authorizedBy || "CSO"}</div>
                      <div className="text-slate-500">{alert.authorizedAt || "Verified"}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "simulate" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  High-Stakes Auto-Intelligence Trigger Simulation
                </h4>
                <p className="text-xs text-slate-400">
                  Inject automated sentinel triggers to test human authority oversight, dual-key authorizations, and executive override readiness in real time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => triggerPresetAlert("liquidity")}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-red-600/80 text-left transition group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-red-300">
                      Treasury Liquidity Lock
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] bg-red-950 text-red-400 rounded font-mono">
                      Critical
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Sovereign rate dislocation triggers autonomous liquidity freeze.
                  </p>
                  <div className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                    <span>Inject Trigger</span>
                    <Zap className="w-3 h-3" />
                  </div>
                </button>

                <button
                  onClick={() => triggerPresetAlert("hostile")}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-red-600/80 text-left transition group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-red-300">
                      Hostile Takeover Defense
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] bg-red-950 text-red-400 rounded font-mono">
                      Critical
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Synthetic equity accumulation triggers automated poison pill defense.
                  </p>
                  <div className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                    <span>Inject Trigger</span>
                    <Zap className="w-3 h-3" />
                  </div>
                </button>

                <button
                  onClick={() => triggerPresetAlert("cyber")}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-600/80 text-left transition group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300">
                      Supply Line Reroute
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] bg-amber-950 text-amber-400 rounded font-mono">
                      High
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Maritime embargo risk triggers automated air freight diversion.
                  </p>
                  <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                    <span>Inject Trigger</span>
                    <Zap className="w-3 h-3" />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-500">
            System Protocol: Maxla Dual Approval Governance Gate
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
