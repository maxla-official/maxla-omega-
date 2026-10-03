import React, { useState } from "react";
import {
  TrendingUp,
  Target,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  BarChart3,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { TargetKpi } from "../types";

interface KpiDashboardViewProps {
  kpis: TargetKpi[];
  onUpdateKpiProgress?: (index: number, progress: number) => void;
}

export const KpiDashboardView: React.FC<KpiDashboardViewProps> = ({
  kpis,
  onUpdateKpiProgress,
}) => {
  const [localKpis, setLocalKpis] = useState<TargetKpi[]>(() =>
    kpis.map((k) => ({
      ...k,
      currentProgress: k.currentProgress !== undefined ? k.currentProgress : 50,
    }))
  );
  const [committedIdx, setCommittedIdx] = useState<number | null>(null);

  React.useEffect(() => {
    setLocalKpis(
      kpis.map((k) => ({
        ...k,
        currentProgress: k.currentProgress !== undefined ? k.currentProgress : 50,
      }))
    );
  }, [kpis]);

  const handleProgressChange = (index: number, val: number) => {
    const updated = [...localKpis];
    updated[index].currentProgress = val;
    setLocalKpis(updated);
    if (onUpdateKpiProgress) {
      onUpdateKpiProgress(index, val);
    }
  };

  const handleCommit = (index: number) => {
    setCommittedIdx(index);
    setTimeout(() => setCommittedIdx(null), 2000);
  };

  const avgProgress = Math.round(
    localKpis.reduce((acc, k) => acc + (k.currentProgress || 0), 0) /
      (localKpis.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Value Realization Ledger & Strategic OKRs
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Quantifiable enterprise success criteria benchmarked against operational baselines. Drag sliders to record verified progress.
          </p>
        </div>

        {/* Aggregate Health Meter */}
        <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">
              Aggregate Delivery Index
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {avgProgress}% On Track
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {localKpis.map((kpi, idx) => {
          const progress = kpi.currentProgress || 0;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-4 hover:border-slate-700/80 transition-all shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                    OKR Vector 0{idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {kpi.metric}
                  </h3>
                </div>

                <div className="flex items-center space-x-1 text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-mono">{kpi.timeframe}</span>
                </div>
              </div>

              {/* Baseline vs Target Split */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">
                    Operational Baseline
                  </span>
                  <span className="font-mono font-bold text-slate-300 text-sm">
                    {kpi.baseline}
                  </span>
                </div>
                <div className="border-l border-slate-800/80 pl-3">
                  <span className="text-[11px] text-emerald-400 block mb-0.5 font-medium">
                    Target Milestone
                  </span>
                  <span className="font-mono font-bold text-emerald-300 text-sm">
                    {kpi.target}
                  </span>
                </div>
              </div>

              {/* Progress Slider + Button controls */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Realization Progress</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-indigo-400 text-sm">
                      {progress}%
                    </span>
                    <button
                      id={`kpi-commit-btn-${idx}`}
                      onClick={() => handleCommit(idx)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition ${
                        committedIdx === idx
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      {committedIdx === idx ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <span>Commit</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleProgressChange(idx, Math.max(0, progress - 5))}
                    className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs border border-slate-700 transition active:scale-95"
                    title="Decrease by 5%"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => handleProgressChange(idx, Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <button
                    onClick={() => handleProgressChange(idx, Math.min(100, progress + 5))}
                    className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs border border-slate-700 transition active:scale-95"
                    title="Increase by 5%"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Slider Presets & Scale */}
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleProgressChange(idx, 25)}
                      className="px-1.5 py-0.2 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      25%
                    </button>
                    <button
                      onClick={() => handleProgressChange(idx, 50)}
                      className="px-1.5 py-0.2 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      50%
                    </button>
                    <button
                      onClick={() => handleProgressChange(idx, 75)}
                      className="px-1.5 py-0.2 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      75%
                    </button>
                    <button
                      onClick={() => handleProgressChange(idx, 100)}
                      className="px-1.5 py-0.2 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 hover:text-emerald-300 border border-emerald-800/40"
                    >
                      100%
                    </button>
                  </div>
                  <span>Target Attained</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
