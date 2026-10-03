import React, { useState, useEffect } from "react";
import {
  Sliders,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Sparkles,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Lock,
  Unlock,
  Gauge,
  Info,
} from "lucide-react";
import { AuthorityAlertLevel } from "../types";

interface ExecutiveSliderControllerProps {
  isAlertModeActive: boolean;
  authorityLevel: AuthorityAlertLevel;
  onCommitThreshold: (threshold: number, level: AuthorityAlertLevel) => void;
  onToggleAlertMode: () => void;
  initialThreshold?: number;
}

export const ExecutiveSliderController: React.FC<ExecutiveSliderControllerProps> = ({
  isAlertModeActive,
  authorityLevel,
  onCommitThreshold,
  onToggleAlertMode,
  initialThreshold = 65,
}) => {
  const [threshold, setThreshold] = useState<number>(initialThreshold);
  const [committedValue, setCommittedValue] = useState<number>(initialThreshold);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);
  const [isAutoCalibrating, setIsAutoCalibrating] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Derived state based on slider position
  const getDerivedLevel = (val: number): AuthorityAlertLevel => {
    if (val <= 35) return "TIER-1 (Critical Override Required)";
    if (val <= 70) return "TIER-2 (Executive Sign-Off Pending)";
    return "TIER-3 (Autonomous Guardrails Active)";
  };

  const currentLevel = getDerivedLevel(threshold);
  const capexGateMillion = Math.round((100 - threshold) * 1.5 + 5); // $5M to $155M gate

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setThreshold(val);
    setIsCommitted(false);
  };

  const handleIncrement = () => {
    setThreshold((prev) => {
      const next = Math.min(100, prev + 5);
      setIsCommitted(false);
      return next;
    });
  };

  const handleDecrement = () => {
    setThreshold((prev) => {
      const next = Math.max(0, prev - 5);
      setIsCommitted(false);
      return next;
    });
  };

  const handlePreset = (val: number) => {
    setThreshold(val);
    setIsCommitted(false);
  };

  const handleCommit = () => {
    setCommittedValue(threshold);
    onCommitThreshold(threshold, currentLevel);
    setIsCommitted(true);
    setTimeout(() => {
      setIsCommitted(false);
    }, 2500);
  };

  const handleAutoCalibrate = () => {
    setIsAutoCalibrating(true);
    // Smooth step animation to recommended optimal value (68%)
    const target = 68;
    let step = threshold;
    const interval = setInterval(() => {
      if (Math.abs(step - target) <= 2) {
        setThreshold(target);
        clearInterval(interval);
        setIsAutoCalibrating(false);
        setCommittedValue(target);
        onCommitThreshold(target, getDerivedLevel(target));
        setIsCommitted(true);
        setTimeout(() => setIsCommitted(false), 2500);
      } else {
        step = step < target ? step + 2 : step - 2;
        setThreshold(step);
      }
    }, 30);
  };

  const handleReset = () => {
    setThreshold(50);
    setIsCommitted(false);
  };

  // Color gradient for the slider track
  const getSliderTrackColor = () => {
    if (threshold <= 35) return "from-red-500 via-rose-500 to-amber-500";
    if (threshold <= 70) return "from-amber-500 via-indigo-500 to-emerald-500";
    return "from-indigo-500 via-emerald-400 to-emerald-500";
  };

  return (
    <div
      id="executive-slider-button-controller"
      className="border-b border-slate-800/90 bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-md transition-all select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top bar with collapse toggle */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs sm:text-sm text-white uppercase tracking-wider font-mono">
                  Autonomous Authority & Sensitivity Slider
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  Interactive Controller
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Slide to adjust automated AI execution threshold versus human sign-off escalation gate.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick value badge */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs">
              <span className="text-slate-400">Automation</span>
              <span className="font-bold text-slate-200">{threshold}%</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Review Threshold</span>
              <span className="font-bold text-slate-200">${capexGateMillion}M</span>
            </div>

            <button
              id="toggle-slider-expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title={isExpanded ? "Collapse Controller" : "Expand Controller"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Slider + Button Panel */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Left: Slider Section (8 cols) */}
            <div className="lg:col-span-8 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-300 font-medium">Automation & Governance Index</span>
                  <span
                    className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                      threshold <= 35
                        ? "bg-slate-900 text-[#EF4444] border border-slate-700"
                        : threshold <= 70
                        ? "bg-slate-900 text-amber-300 border border-slate-700"
                        : "bg-slate-900 text-emerald-300 border border-slate-700"
                    }`}
                  >
                    {currentLevel}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 font-mono text-xs">
                  <span className="text-slate-400">Value:</span>
                  <span className="font-bold text-white text-sm">{threshold}%</span>
                  {threshold !== committedValue && (
                    <span className="text-[10px] text-amber-400 font-sans italic">(Unsaved)</span>
                  )}
                </div>
              </div>

              {/* Slider Input with Minus/Plus Stepper Buttons */}
              <div className="flex items-center space-x-3">
                {/* Decrement Button */}
                <button
                  id="slider-decrement-btn"
                  onClick={handleDecrement}
                  disabled={threshold <= 0}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition border border-slate-700 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                  title="Decrease threshold by 5%"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                {/* Range Slider */}
                <div className="relative flex-1 flex items-center">
                  <input
                    id="executive-sensitivity-range-slider"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={threshold}
                    onChange={handleSliderChange}
                    className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                {/* Increment Button */}
                <button
                  id="slider-increment-btn"
                  onClick={handleIncrement}
                  disabled={threshold >= 100}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition border border-slate-700 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                  title="Increase threshold by 5%"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Slider Scale Indicators and Presets */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-slate-400">Presets:</span>
                  <button
                    onClick={() => handlePreset(20)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition ${
                      threshold === 20
                        ? "bg-red-950 text-red-300 border border-red-700"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    20% Strict
                  </button>
                  <button
                    onClick={() => handlePreset(50)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition ${
                      threshold === 50
                        ? "bg-amber-950 text-amber-300 border border-amber-700"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    50% Balanced
                  </button>
                  <button
                    onClick={() => handlePreset(75)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition ${
                      threshold === 75
                        ? "bg-indigo-950 text-indigo-300 border border-indigo-700"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    75% Enterprise
                  </button>
                  <button
                    onClick={() => handlePreset(95)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition ${
                      threshold === 95
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    95% Autonomous
                  </button>
                </div>

                <div className="hidden sm:flex items-center space-x-3 text-[10px] font-mono">
                  <span>0% (Lockdown)</span>
                  <span>50% (Standard)</span>
                  <span>100% (Full Auto)</span>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons Section (4 cols) */}
            <div className="lg:col-span-4 flex flex-wrap lg:flex-nowrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/60">
              {/* Primary Commit Button */}
              <button
                id="slider-commit-button"
                onClick={handleCommit}
                className={`flex-1 py-2 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-95 border ${
                  isCommitted
                    ? "bg-slate-900 border-slate-700 text-emerald-400"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
                }`}
              >
                {isCommitted ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Approved & Calibrated ({threshold}%)</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-slate-300" />
                    <span>Approve & Proceed</span>
                  </>
                )}
              </button>

              {/* Auto-Calibrate (AI) Button */}
              <button
                id="slider-ai-calibrate-button"
                onClick={handleAutoCalibrate}
                disabled={isAutoCalibrating}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-indigo-500/50 text-xs font-semibold flex items-center justify-center space-x-1.5 transition active:scale-95 disabled:opacity-50"
                title="Use Gemini AI to dynamically optimize sensitivity index"
              >
                <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isAutoCalibrating ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">AI Optimize</span>
              </button>

              {/* Reset Button */}
              <button
                id="slider-reset-button"
                onClick={handleReset}
                className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition"
                title="Reset slider to 50%"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
