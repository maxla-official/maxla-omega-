import React, { useState } from "react";
import { GitFork, HelpCircle, Zap, ShieldCheck, ChevronRight, Check } from "lucide-react";
import { MecePillar } from "../types";

interface MeceBreakdownViewProps {
  pillars: MecePillar[];
}

export const MeceBreakdownView: React.FC<MeceBreakdownViewProps> = ({ pillars }) => {
  const [activePillarIndex, setActivePillarIndex] = useState(0);
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});

  const toggleQuestion = (pillarIdx: number, qIdx: number) => {
    const key = `${pillarIdx}-${qIdx}`;
    setCheckedQuestions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentPillar = pillars[activePillarIndex] || pillars[0];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              MECE Deconstruction Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Mutually Exclusive, Collectively Exhaustive strategic investigation pillars designed to eliminate informational blindspots.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Zero Redundancy Verified
          </span>
        </div>
      </div>

      {/* Pillars Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {pillars.map((pillar, idx) => {
          const isSelected = idx === activePillarIndex;
          return (
            <button
              key={idx}
              onClick={() => setActivePillarIndex(idx)}
              className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/50"
                  : "bg-slate-900/70 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
              }`}
            >
              <div className="space-y-1">
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isSelected ? "text-indigo-400" : "text-slate-500"
                  }`}
                >
                  Pillar 0{idx + 1}
                </span>
                <h3 className="text-sm font-bold text-white line-clamp-2">
                  {pillar.pillarName.replace(/Pillar [0-9A-Z]+:\s*/i, "")}
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                <span className="text-slate-400 text-[11px]">
                  {pillar.keyQuestions.length} Inquiry Vectors
                </span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isSelected ? "text-indigo-400 translate-x-1" : "text-slate-600"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Pillar Deep Dive */}
      {currentPillar && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-xl">
          {/* Pillar Hypothesis */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                Core Working Hypothesis
              </span>
            </div>
            <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              "{currentPillar.hypothesis}"
            </p>
          </div>

          {/* Strategic Questions & Verification Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Critical Verification Queries (Auditable Evidence Requirements)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Click to mark reviewed
              </span>
            </div>

            <div className="space-y-2.5">
              {currentPillar.keyQuestions.map((q, qIdx) => {
                const isChecked = !!checkedQuestions[`${activePillarIndex}-${qIdx}`];
                return (
                  <div
                    key={qIdx}
                    onClick={() => toggleQuestion(activePillarIndex, qIdx)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-start space-x-3.5 ${
                      isChecked
                        ? "bg-slate-950/80 border-emerald-800/50 text-slate-300"
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                        isChecked
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "border-slate-700 bg-slate-900 text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-xs sm:text-sm leading-snug">
                      <span className={isChecked ? "line-through text-slate-400" : ""}>
                        {q}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leverage Points & Strategic Interventions */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-800/40 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Highest-Leverage Structural Intervention</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {currentPillar.leveragePoints}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
