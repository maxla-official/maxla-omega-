import React from "react";
import {
  FileText,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  Target,
  Clock,
  DollarSign,
  ShieldAlert,
} from "lucide-react";
import { AnalysisResult, ProblemDomain, UrgencyLevel } from "../types";

interface ExecutiveSummaryViewProps {
  title: string;
  domain: ProblemDomain;
  urgency: UrgencyLevel;
  context: string;
  data: AnalysisResult;
  onNavigateToTab: (tabId: string) => void;
  isAlertModeActive?: boolean;
  onOpenAuthorityCenter?: () => void;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({
  title,
  domain,
  urgency,
  context,
  data,
  onNavigateToTab,
  isAlertModeActive = true,
  onOpenAuthorityCenter,
}) => {
  const recommendedOpt = data.strategicOptions.find(
    (o) => o.id === data.recommendedStrategy.selectedOptionId
  ) || data.strategicOptions[0];

  return (
    <div className="space-y-6">
      {/* Top Hero Card - Strategic Synthesis */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {domain}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
                {urgency}
              </span>
              {isAlertModeActive && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-slate-800 text-slate-200 border border-slate-700">
                  Executive Review Required
                </span>
              )}
              <span className="text-xs text-slate-500 font-mono">
                Deconstructed by Maxla Executive Intelligence
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug">
              {title}
            </h1>

            {context && (
              <p className="text-xs sm:text-sm text-slate-400 italic border-l-2 border-slate-700 pl-3 py-0.5">
                "{context}"
              </p>
            )}

            <div className="pt-2 text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              {data.executiveSummary}
            </div>
          </div>

          {/* Quick Metrics Badge Column */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-3 lg:w-72 shrink-0">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center space-x-2 text-slate-300 text-xs font-semibold mb-1">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Recommended Option</span>
              </div>
              <p className="text-sm font-bold text-white line-clamp-1">
                {recommendedOpt?.name}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Impact: {recommendedOpt?.impactScore}/10 • Feasibility: {recommendedOpt?.feasibilityScore}/10
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center space-x-2 text-slate-300 text-xs font-semibold mb-1">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Time to First Value</span>
              </div>
              <p className="text-sm font-bold text-white">
                {recommendedOpt?.timeToValueWeeks} Weeks
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target Capex: {recommendedOpt?.estimatedCapex}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 text-slate-300 text-xs font-semibold mb-1">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>MECE Risk Enclaves</span>
              </div>
              <p className="text-sm font-bold text-white">
                {data.mecePillars.length} Strategic Pillars Identified
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {data.riskHeatmap.length} Ring-Fenced Critical Exposures
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Human Authority Operational Gate Callout */}
      {isAlertModeActive && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Dual Approval Workflow Active: Executive Sign-Off Required
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  TIER-1 RISK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated intelligence syntheses and capital commitments require dual executive authorization before operational execution.
              </p>
            </div>
          </div>

          {onOpenAuthorityCenter && (
            <button
              onClick={onOpenAuthorityCenter}
              className="shrink-0 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition"
            >
              Review Decision Center →
            </button>
          )}
        </div>
      )}

      {/* Symptoms vs. Root Causes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Symptoms */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Observable Surface Symptoms
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {data.problemDeconstruction.primarySymptoms.length} Anomalies
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Immediate performance indicators and operational friction visible to executives:
          </p>

          <ul className="space-y-2.5">
            {data.problemDeconstruction.primarySymptoms.map((symptom, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-200"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span>{symptom}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Underlying Root Causes (Fishbone / 5-Whys Diagnostic) */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Deep Root-Cause Architecture
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Causality Traced</span>
          </div>

          <p className="text-xs text-slate-400">
            Underlying structural failures driving downstream variance:
          </p>

          <div className="space-y-3">
            {data.problemDeconstruction.underlyingRootCauses.map((rc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800/40">
                    {rc.category}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  {rc.cause}
                </p>
                <div className="flex items-center text-[11px] text-amber-400/90 space-x-1.5">
                  <span className="font-mono text-slate-500">Measurable Impact:</span>
                  <span>{rc.evidenceImpact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Strategy Callout */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-800/50 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              Selected Strategic Trajectory: {recommendedOpt?.name}
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab("decision-matrix")}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
          >
            Inspect Decision Matrix →
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {data.recommendedStrategy.recommendationRationale}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Decisive Differentiators
            </h4>
            <div className="space-y-1.5">
              {data.recommendedStrategy.decisiveDifferentiators.map((diff, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-2 text-xs text-slate-200"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{diff}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Unintended Consequences Safeguard
            </h4>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-normal">
              {data.recommendedStrategy.unintendedConsequencesMitigation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
