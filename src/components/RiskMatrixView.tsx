import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, LifeBuoy, Zap, ChevronRight, CheckCircle2 } from "lucide-react";
import { RiskItem } from "../types";

interface RiskMatrixViewProps {
  risks: RiskItem[];
}

export const RiskMatrixView: React.FC<RiskMatrixViewProps> = ({ risks }) => {
  const [selectedRiskIndex, setSelectedRiskIndex] = useState<number | null>(0);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  const selectedRisk = selectedRiskIndex !== null ? risks[selectedRiskIndex] : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Enterprise Risk Heatmap & Contingency Protocols
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            5x5 Probability vs. Impact assessment with pre-authorized automated contingency tripwires.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {risks.length} Monitored Vectors
          </span>
        </div>
      </div>

      {/* Grid and Risk Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive 5x5 Risk Grid Visualizer */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Risk Topology (Probability vs. Impact)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              Click node to inspect mitigation
            </span>
          </div>

          <div className="relative aspect-square max-w-md mx-auto p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            {/* Y-axis label */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Impact (1 to 5) →
            </div>

            {/* 5x5 Grid Cells */}
            <div className="grid grid-rows-5 grid-cols-5 gap-1.5 h-full w-full">
              {[5, 4, 3, 2, 1].map((impactRow) =>
                [1, 2, 3, 4, 5].map((probCol) => {
                  // Severity color heuristic
                  const score = impactRow * probCol;
                  const bgCell =
                    score >= 16
                      ? "bg-rose-950/40 border-rose-900/50"
                      : score >= 10
                      ? "bg-amber-950/30 border-amber-900/40"
                      : "bg-slate-900/40 border-slate-800/60";

                  // Find risks in this cell
                  const matchingRisks = risks.filter(
                    (r) =>
                      Math.round(r.impactScore) === impactRow &&
                      Math.round(r.probabilityScore) === probCol
                  );

                  return (
                    <div
                      key={`${impactRow}-${probCol}`}
                      className={`relative rounded-md border flex items-center justify-center p-0.5 transition-all ${bgCell}`}
                    >
                      {matchingRisks.map((mr) => {
                        const originalIndex = risks.indexOf(mr);
                        const isSelected = selectedRiskIndex === originalIndex;
                        return (
                          <button
                            key={mr.riskTitle}
                            onClick={() => setSelectedRiskIndex(originalIndex)}
                            className={`w-6 h-6 rounded-full font-mono text-[10px] font-bold flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-indigo-500 text-white ring-2 ring-white scale-110 z-10"
                                : "bg-rose-600/90 text-white hover:scale-105"
                            }`}
                            title={mr.riskTitle}
                          >
                            R{originalIndex + 1}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* X-axis label */}
            <div className="text-center pt-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Probability (1 to 5) →
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-slate-800" />
              <span>Low (1-9)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-amber-950 border border-amber-800" />
              <span>Moderate (10-15)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-rose-950 border border-rose-800" />
              <span>Severe (16-25)</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Risk & Protocol Details */}
        <div className="lg:col-span-6 space-y-4">
          {selectedRisk ? (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-5 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded">
                      R{selectedRiskIndex !== null ? selectedRiskIndex + 1 : 1}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Prob: {selectedRisk.probabilityScore} • Impact: {selectedRisk.impactScore}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {selectedRisk.riskTitle}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-800/50">
                    Severity: {Math.round(selectedRisk.probabilityScore * selectedRisk.impactScore)}
                  </span>
                </div>
              </div>

              {/* Mitigation Protocol */}
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <LifeBuoy className="w-4 h-4 text-indigo-400" />
                  <span>Proactive Mitigation Protocol</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  {selectedRisk.mitigationProtocol}
                </p>
              </div>

              {/* Contingency Trigger Tripwire */}
              <div className="space-y-2 p-4 rounded-xl bg-gradient-to-r from-rose-950/30 via-slate-950 to-slate-950 border border-rose-900/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Contingency Trigger Condition</span>
                  </div>
                  <button
                    onClick={() =>
                      setActiveSimulation(
                        activeSimulation === selectedRisk.riskTitle
                          ? null
                          : selectedRisk.riskTitle
                      )
                    }
                    className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 underline underline-offset-2"
                  >
                    {activeSimulation === selectedRisk.riskTitle
                      ? "Stand Down Drill"
                      : "Simulate Tripwire"}
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedRisk.contingencyTrigger}
                </p>

                {activeSimulation === selectedRisk.riskTitle && (
                  <div className="mt-3 p-3 rounded-lg bg-rose-950/80 border border-rose-600 text-xs text-rose-200 space-y-1 animate-in fade-in">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>SIMULATED ESCALATION ACTIVE</span>
                    </div>
                    <p className="text-[11px]">
                      Trigger tripwire reached. Maxla has engaged out-of-band redundancy routing and notified the executive steering committee.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick List of All Risks */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  All Identified Risk Exposures
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {risks.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedRiskIndex(i)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                        selectedRiskIndex === i
                          ? "bg-indigo-950/50 border-indigo-500 text-white"
                          : "bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                      }`}
                    >
                      <span className="truncate pr-2 font-medium">
                        R{i + 1}: {r.riskTitle}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs rounded-2xl bg-slate-900/40 border border-slate-800">
              Select a risk node from the matrix to inspect contingency protocols.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
