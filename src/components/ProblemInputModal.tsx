import React, { useState } from "react";
import { X, Sparkles, AlertCircle, ArrowRight, Zap, Check } from "lucide-react";
import { ProblemDomain, ProblemScope, UrgencyLevel, ProblemInput } from "../types";

interface ProblemInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ProblemInput) => Promise<void>;
  isLoading: boolean;
  initialInput?: Partial<ProblemInput> | null;
}

const DOMAINS: ProblemDomain[] = [
  "Corporate Strategy",
  "Global Supply Chain",
  "FinTech & Capital Markets",
  "DeepTech & Cloud Infrastructure",
  "Geopolitics & Trade Compliance",
  "Crisis & Incident Escalation",
  "Operational Restructuring",
];

const SCOPES: ProblemScope[] = [
  "Global Enterprise",
  "Multinational Business Unit",
  "High-Growth Scaleup",
  "Critical Infrastructure Provider",
];

const URGENCIES: UrgencyLevel[] = [
  "Critical (Immediate Triage)",
  "High (90-Day Sprint)",
  "Medium (Strategic Horizon)",
];

const PRESET_TEMPLATES = [
  {
    label: "Cross-Border M&A Post-Merger Integration",
    domain: "Corporate Strategy" as ProblemDomain,
    scope: "Global Enterprise" as ProblemScope,
    urgency: "High (90-Day Sprint)" as UrgencyLevel,
    context: "Integrating two $4B enterprise software companies across 18 countries. Divergent engineering cultures, duplicate CRM systems, and customer churn threats during sales team consolidation.",
    constraints: ["Zero voluntary departure among top 5% engineering leaders", "Target $120M annualized operational synergy capture by Q4"],
  },
  {
    label: "Enterprise GenAI Infrastructure & Data Residency Overhaul",
    domain: "DeepTech & Cloud Infrastructure" as ProblemDomain,
    scope: "Multinational Business Unit" as ProblemScope,
    urgency: "Critical (Immediate Triage)" as UrgencyLevel,
    context: "Customer data sovereignty compliance in Europe & Asia prohibits sending raw embeddings across regional borders. Compute costs exploding by 340% YoY with single-cloud vendor lock-in.",
    constraints: ["Sub-40ms P95 token latency", "Multi-region hybrid deployment with zero cross-border telemetry leakage"],
  },
  {
    label: "Automotive EV Battery Cell Sourcing Volatility & Tariff Defense",
    domain: "Global Supply Chain" as ProblemDomain,
    scope: "Global Enterprise" as ProblemScope,
    urgency: "High (90-Day Sprint)" as UrgencyLevel,
    context: "Critical raw material export restrictions on lithium and nickel threaten production of 450,000 electric vehicles. Immediate need to establish localized recycling and secondary cell qualification.",
    constraints: ["Strict vehicle safety homologation compliance", "Unit pack cost increase capped under 6%"],
  },
  {
    label: "Ransomware Containment in Healthcare Hospital Network",
    domain: "Crisis & Incident Escalation" as ProblemDomain,
    scope: "Critical Infrastructure Provider" as ProblemScope,
    urgency: "Critical (Immediate Triage)" as UrgencyLevel,
    context: "Active lateral movement detected in tertiary healthcare provider network affecting 24 regional surgical facilities. Zero tolerance for patient care disruption.",
    constraints: ["Chain of custody preservation for regulatory compliance", "Maintain life-support and emergency telemetry uninterrupted"],
  },
];

export const ProblemInputModal: React.FC<ProblemInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialInput,
}) => {
  const [title, setTitle] = useState(initialInput?.title || "");
  const [domain, setDomain] = useState<ProblemDomain>(initialInput?.domain || "Corporate Strategy");
  const [scope, setScope] = useState<ProblemScope>(initialInput?.scope || "Global Enterprise");
  const [urgency, setUrgency] = useState<UrgencyLevel>(initialInput?.urgency || "High (90-Day Sprint)");
  const [context, setContext] = useState(initialInput?.context || "");
  const [constraintInput, setConstraintInput] = useState("");
  const [constraints, setConstraints] = useState<string[]>(
    initialInput?.constraints || [
      "Capital efficiency and resource optimization",
      "Zero disruption to baseline customer commitments",
    ]
  );

  React.useEffect(() => {
    if (initialInput && isOpen) {
      if (initialInput.title) setTitle(initialInput.title);
      if (initialInput.domain) setDomain(initialInput.domain);
      if (initialInput.scope) setScope(initialInput.scope);
      if (initialInput.urgency) setUrgency(initialInput.urgency);
      if (initialInput.context) setContext(initialInput.context);
      if (initialInput.constraints) setConstraints(initialInput.constraints);
    }
  }, [initialInput, isOpen]);

  if (!isOpen) return null;

  const handleAddConstraint = () => {
    if (constraintInput.trim() && !constraints.includes(constraintInput.trim())) {
      setConstraints([...constraints, constraintInput.trim()]);
      setConstraintInput("");
    }
  };

  const handleRemoveConstraint = (index: number) => {
    setConstraints(constraints.filter((_, i) => i !== index));
  };

  const handleApplyTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    setTitle(tpl.label);
    setDomain(tpl.domain);
    setScope(tpl.scope);
    setUrgency(tpl.urgency);
    setContext(tpl.context);
    setConstraints(tpl.constraints);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await onSubmit({
        title: title.trim(),
        domain,
        scope,
        urgency,
        context: context.trim(),
        constraints,
      });
    } catch (err) {
      console.warn("Problem submission handled error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Architect World-Level Strategic Solution (Solve Masla)
              </h2>
              <p className="text-xs text-slate-400">
                Input any complex challenge to initiate MECE deconstruction and executive decision modeling.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Accelerate with World-Class Industry Dilemmas
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="text-left p-2.5 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-indigo-950/40 hover:border-indigo-800/60 transition-all text-xs text-slate-300 flex items-start space-x-2 group"
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5 group-hover:text-indigo-300" />
                  <span className="font-medium group-hover:text-white line-clamp-1">
                    {tpl.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Problem Statement Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Challenge Title / Core Masla Statement <span className="text-rose-400">*</span>
            </label>
            <input
              id="problem-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mitigating 40% Gross Margin Deterioration Across EMEA Cloud Infrastructure..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Domain & Scope Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Domain Pillar
              </label>
              <select
                id="problem-domain-select"
                value={domain}
                onChange={(e) => setDomain(e.target.value as ProblemDomain)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Operating Scope
              </label>
              <select
                id="problem-scope-select"
                value={scope}
                onChange={(e) => setScope(e.target.value as ProblemScope)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {SCOPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Urgency Level
              </label>
              <select
                id="problem-urgency-select"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {URGENCIES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Context & Constraints */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Background Context, Stakeholders & Historical Friction
            </label>
            <textarea
              id="problem-context-textarea"
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Provide relevant organizational, technical, or financial background..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Constraints & Non-Negotiables */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Key Guardrails & Constraints (Non-Negotiables)
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={constraintInput}
                onChange={(e) => setConstraintInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddConstraint();
                  }
                }}
                placeholder="e.g. Regulatory compliance with SEC Rule 10b-5..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddConstraint}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
              >
                Add Guardrail
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {constraints.map((c, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700"
                >
                  <span>{c}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveConstraint(idx)}
                    className="ml-1.5 text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center text-xs text-slate-400 space-x-1.5">
              <AlertCircle className="w-4 h-4 text-indigo-400" />
              <span>Full AI deconstruction takes 4-8 seconds.</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                id="submit-problem-button"
                type="submit"
                disabled={isLoading || !title.trim()}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center space-x-2 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Strategy with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Synthesize Solution Architecture</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
