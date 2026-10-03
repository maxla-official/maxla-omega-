import React, { useState, useMemo } from "react";
import {
  Sliders,
  CheckCircle,
  Award,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Check,
  X,
  ShieldAlert,
  Minus,
  Plus,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { StrategicOption, DecisionWeights } from "../types";

interface DecisionMatrixViewProps {
  options: StrategicOption[];
  recommendedOptionId: string;
  onSelectOption: (optionId: string) => void;
  isAlertModeActive?: boolean;
  onOpenAuthorityCenter?: () => void;
}

export const DecisionMatrixView: React.FC<DecisionMatrixViewProps> = ({
  options,
  recommendedOptionId,
  onSelectOption,
  isAlertModeActive = true,
  onOpenAuthorityCenter,
}) => {
  const [weights, setWeights] = useState<DecisionWeights>({
    impact: 30,
    feasibility: 25,
    speed: 15,
    costEfficiency: 15,
    riskTolerance: 15,
  });

  const [selectedId, setSelectedId] = useState<string>(recommendedOptionId);

  // Normalize weights
  const totalWeight = useMemo(() => {
    return (
      weights.impact +
      weights.feasibility +
      weights.speed +
      weights.costEfficiency +
      weights.riskTolerance
    );
  }, [weights]);

  // Calculate composite weighted scores for each option
  const rankedOptions = useMemo(() => {
    return options.map((opt) => {
      // speed score: inverse of timeToValue (lower weeks = higher score out of 10)
      const speedScore = Math.max(1, Math.min(10, 10 - opt.timeToValueWeeks / 5));

      // risk score: Low = 9.5, Moderate = 7.5, High = 4.5, Critical = 2.0
      const riskScore =
        opt.riskLevel === "Low"
          ? 9.5
          : opt.riskLevel === "Moderate"
          ? 7.5
          : opt.riskLevel === "High"
          ? 4.5
          : 2.0;

      // cost score: heuristic based on type
      const costScore =
        opt.type.toLowerCase().includes("outsourc") || opt.type.toLowerCase().includes("triage")
          ? 6.0
          : opt.type.toLowerCase().includes("phased")
          ? 8.5
          : 5.5;

      const wImpact = (weights.impact / totalWeight) * opt.impactScore;
      const wFeasibility = (weights.feasibility / totalWeight) * opt.feasibilityScore;
      const wSpeed = (weights.speed / totalWeight) * speedScore;
      const wCost = (weights.costEfficiency / totalWeight) * costScore;
      const wRisk = (weights.riskTolerance / totalWeight) * riskScore;

      const compositeScore = Number(
        (wImpact + wFeasibility + wSpeed + wCost + wRisk).toFixed(2)
      );

      return {
        ...opt,
        speedScore,
        riskScore,
        costScore,
        compositeScore,
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);
  }, [options, weights, totalWeight]);

  const handleWeightChange = (key: keyof DecisionWeights, val: number) => {
    setWeights((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Multi-Criteria Strategic Decision Matrix (MCDA)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Adjust strategic weighting criteria dynamically to evaluate trade-offs, sensitivity frontiers, and risk-adjusted alpha.
          </p>
        </div>

        <button
          onClick={() =>
            setWeights({
              impact: 30,
              feasibility: 25,
              speed: 15,
              costEfficiency: 15,
              riskTolerance: 15,
            })
          }
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors self-start lg:self-auto"
        >
          Reset Baseline Weights
        </button>
      </div>

      {/* Dynamic Weight Sliders Panel */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Executive Decision Weighting Sliders & Steppers
            </span>
          </div>

          {/* Quick Scenario Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-mono text-[10px] mr-1">Presets:</span>
            <button
              onClick={() =>
                setWeights({
                  impact: 45,
                  feasibility: 15,
                  speed: 15,
                  costEfficiency: 15,
                  riskTolerance: 10,
                })
              }
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-medium"
            >
              Growth Focus
            </button>
            <button
              onClick={() =>
                setWeights({
                  impact: 20,
                  feasibility: 20,
                  speed: 40,
                  costEfficiency: 10,
                  riskTolerance: 10,
                })
              }
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-medium"
            >
              Rapid Speed
            </button>
            <button
              onClick={() =>
                setWeights({
                  impact: 20,
                  feasibility: 25,
                  speed: 10,
                  costEfficiency: 10,
                  riskTolerance: 35,
                })
              }
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-medium"
            >
              Risk Defense
            </button>
            <button
              onClick={() =>
                setWeights({
                  impact: 30,
                  feasibility: 25,
                  speed: 15,
                  costEfficiency: 15,
                  riskTolerance: 15,
                })
              }
              className="px-2 py-0.5 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 transition font-medium"
            >
              MECE Balanced
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
          {/* Weight 1: Impact */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Value & Impact</span>
              <span className="font-mono text-indigo-400 font-bold">
                {Math.round((weights.impact / totalWeight) * 100)}%
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleWeightChange("impact", Math.max(5, weights.impact - 5))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs border border-slate-700"
                title="Decrease"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="5"
                max="60"
                value={weights.impact}
                onChange={(e) => handleWeightChange("impact", Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <button
                onClick={() => handleWeightChange("impact", Math.min(60, weights.impact + 5))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs border border-slate-700"
                title="Increase"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Weight 2: Feasibility */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Feasibility</span>
              <span className="font-mono text-indigo-400 font-bold">
                {Math.round((weights.feasibility / totalWeight) * 100)}%
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleWeightChange("feasibility", Math.max(5, weights.feasibility - 5))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs border border-slate-700"
                title="Decrease"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="5"
                max="60"
                value={weights.feasibility}
                onChange={(e) => handleWeightChange("feasibility", Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <button
                onClick={() => handleWeightChange("feasibility", Math.min(60, weights.feasibility + 5))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs border border-slate-700"
                title="Increase"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Weight 3: Speed */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Time to Value</span>
              <span className="font-mono text-indigo-400 font-bold">
                {Math.round((weights.speed / totalWeight) * 100)}%
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleWeightChange("speed", Math.max(5, weights.speed - 5))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs border border-slate-700"
                title="Decrease"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="5"
                max="60"
                value={weights.speed}
                onChange={(e) => handleWeightChange("speed", Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <button
                onClick={() => handleWeightChange("speed", Math.min(60, weights.speed + 5))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs border border-slate-700"
                title="Increase"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Weight 4: Capital Efficiency */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">CapEx / OpEx</span>
              <span className="font-mono text-indigo-400 font-bold">
                {Math.round((weights.costEfficiency / totalWeight) * 100)}%
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleWeightChange("costEfficiency", Math.max(5, weights.costEfficiency - 5))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs border border-slate-700"
                title="Decrease"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="5"
                max="60"
                value={weights.costEfficiency}
                onChange={(e) => handleWeightChange("costEfficiency", Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <button
                onClick={() => handleWeightChange("costEfficiency", Math.min(60, weights.costEfficiency + 5))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs border border-slate-700"
                title="Increase"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Weight 5: Risk Tolerance */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Risk Containment</span>
              <span className="font-mono text-indigo-400 font-bold">
                {Math.round((weights.riskTolerance / totalWeight) * 100)}%
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleWeightChange("riskTolerance", Math.max(5, weights.riskTolerance - 5))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs border border-slate-700"
                title="Decrease"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="5"
                max="60"
                value={weights.riskTolerance}
                onChange={(e) => handleWeightChange("riskTolerance", Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <button
                onClick={() => handleWeightChange("riskTolerance", Math.min(60, weights.riskTolerance + 5))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs border border-slate-700"
                title="Increase"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Options Ranking Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {rankedOptions.map((opt, rankIdx) => {
          const isSelected = opt.id === selectedId;
          const isTopRanked = rankIdx === 0;

          return (
            <div
              key={opt.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? "bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-950/50 ring-1 ring-indigo-500/50"
                  : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        isTopRanked
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      #{rankIdx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      {opt.type}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-mono text-xs font-bold text-white">
                      {opt.compositeScore}
                    </span>
                    <span className="text-[10px] text-slate-500">/ 10</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                  {opt.name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              {/* Card Metrics Grid */}
              <div className="p-5 space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block">Feasibility</span>
                    <span className="font-mono font-bold text-slate-200">
                      {opt.feasibilityScore} / 10
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block">Strategic Impact</span>
                    <span className="font-mono font-bold text-slate-200">
                      {opt.impactScore} / 10
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block">Time to Value</span>
                    <span className="font-mono font-bold text-slate-200">
                      {opt.timeToValueWeeks} Weeks
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block">Risk Rating</span>
                    <span
                      className={`font-semibold text-xs ${
                        opt.riskLevel === "Low"
                          ? "text-emerald-400"
                          : opt.riskLevel === "Moderate"
                          ? "text-indigo-400"
                          : opt.riskLevel === "High"
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {opt.riskLevel}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-x-1">
                  <span className="font-medium text-slate-300">Target Capex:</span>
                  <span className="font-mono text-slate-200">{opt.estimatedCapex}</span>
                </div>

                {/* Pros and Cons */}
                <div className="space-y-2 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Strategic Advantages
                    </span>
                    {opt.pros.map((pro, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-start space-x-2 text-[11px] text-slate-300"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                      Trade-Offs & Friction
                    </span>
                    {opt.cons.map((con, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex items-start space-x-2 text-[11px] text-slate-300"
                      >
                        <X className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Selection */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-2">
                <button
                  id={`select-option-${opt.id}`}
                  onClick={() => {
                    setSelectedId(opt.id);
                    onSelectOption(opt.id);
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Active Operating Option</span>
                    </>
                  ) : (
                    <span>Promote as Operating Strategy</span>
                  )}
                </button>

                {isSelected && isAlertModeActive && (
                  <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                    <div className="flex items-center gap-1.5 font-mono">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dual Approval Workflow Active</span>
                    </div>
                    {onOpenAuthorityCenter && (
                      <button
                        onClick={onOpenAuthorityCenter}
                        className="text-[10px] font-bold text-slate-200 hover:text-white underline underline-offset-2"
                      >
                        Sign-off
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
