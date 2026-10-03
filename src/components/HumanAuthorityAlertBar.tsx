import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  AlertTriangle,
  UserCheck,
  Lock,
  Unlock,
  ChevronRight,
  BellRing,
  Power,
  Zap,
  Printer,
} from "lucide-react";
import { AuthorityAlert, AuthorityAlertLevel } from "../types";

interface HumanAuthorityAlertBarProps {
  isAlertModeActive: boolean;
  authorityLevel: AuthorityAlertLevel;
  activeAlerts: AuthorityAlert[];
  onToggleAlertMode: () => void;
  onOpenCommandCenter: () => void;
  onQuickAuthorizeAll?: () => void;
  onOpenApprovalLog?: () => void;
  onOpenApprovalPdf?: () => void;
}

export const HumanAuthorityAlertBar: React.FC<HumanAuthorityAlertBarProps> = ({
  isAlertModeActive,
  authorityLevel,
  activeAlerts,
  onToggleAlertMode,
  onOpenCommandCenter,
  onQuickAuthorizeAll,
  onOpenApprovalLog,
  onOpenApprovalPdf,
}) => {
  const pendingCount = activeAlerts.filter((a) => a.status === "active").length;
  const criticalCount = activeAlerts.filter(
    (a) => a.status === "active" && a.severity === "critical"
  ).length;

  return (
    <div
      id="human-authority-alert-bar"
      className="w-full border-b border-slate-800/90 bg-slate-950 select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Alert Status Beacon & Title */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[11px] border transition-all ${
                isAlertModeActive
                  ? "bg-slate-900 border-slate-700 text-slate-200"
                  : "bg-slate-900 border-slate-800 text-slate-400"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isAlertModeActive ? "bg-[#EF4444]" : "bg-slate-600"
                  }`}
                />
              </span>
              <span>
                {isAlertModeActive
                  ? "Executive Review Required"
                  : "Executive Review Protocol: STANDBY"}
              </span>
            </div>

            {/* Level Badge */}
            {isAlertModeActive && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-300 font-mono font-semibold px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                <Lock className="w-3 h-3 text-slate-400" />
                Dual Approval Workflow Active
              </span>
            )}
          </div>

          {/* Center: Real-time Telemetry */}
          {isAlertModeActive && (
            <div className="hidden lg:flex items-center gap-4 text-slate-300 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Governance Gate:</span>
                <span className="font-bold text-white font-mono">100% In-The-Loop</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Pending Actions:</span>
                <span
                  className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                    pendingCount > 0
                      ? "bg-slate-900 text-slate-200 border border-slate-700"
                      : "bg-slate-900 text-emerald-400 border border-slate-800"
                  }`}
                >
                  {pendingCount} Awaiting Sign-off
                </span>
                {criticalCount > 0 && (
                  <span className="text-[#EF4444] font-bold font-mono">
                    ({criticalCount} Critical)
                  </span>
                )}
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <UserCheck className="w-3.5 h-3.5 text-slate-300" />
                <span>Signer: Chief Strategy Officer</span>
              </div>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Open Command Center Button */}
            <button
              id="open-authority-command-center-btn"
              onClick={onOpenCommandCenter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition shadow-sm"
            >
              <ShieldAlert className={`w-3.5 h-3.5 ${pendingCount > 0 ? "text-[#EF4444]" : "text-slate-300"}`} />
              <span>Decision Center</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#EF4444] text-white font-mono">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Approval Log Shortcut Button */}
            {onOpenApprovalLog && (
              <button
                id="bar-open-approval-log-btn"
                onClick={onOpenApprovalLog}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition"
                title="View Cryptographic Approval & Audit Log"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Approval Log</span>
              </button>
            )}

            {/* Approval PDF Shortcut Button */}
            {onOpenApprovalPdf && (
              <button
                id="bar-open-approval-pdf-btn"
                onClick={onOpenApprovalPdf}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-700/80 text-xs font-semibold transition active:scale-95 shadow-sm"
                title="Print or Export Executive Approval Trail as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Approval PDF</span>
              </button>
            )}

            {/* Quick Authorize if pending */}
            {isAlertModeActive && pendingCount > 0 && onQuickAuthorizeAll && (
              <button
                id="quick-authorize-all-btn"
                onClick={onQuickAuthorizeAll}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-700/60 text-xs font-medium transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sign-Off All ({pendingCount})</span>
              </button>
            )}

            {/* Mode Switch Toggle Button */}
            <button
              id="toggle-human-authority-mode-btn"
              onClick={onToggleAlertMode}
              title={
                isAlertModeActive
                  ? "Deactivate Executive Review Mode to Standby"
                  : "Activate Executive Review Mode"
              }
              className={`p-1.5 rounded-lg border transition ${
                isAlertModeActive
                  ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
