import React, { useState } from "react";
import { X, Copy, Check, Download, Printer, FileText, Code, CheckCircle2 } from "lucide-react";
import { AnalysisResult, ProblemDomain, UrgencyLevel } from "../types";
import { copyToClipboard } from "../utils/clipboard";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  domain: ProblemDomain;
  urgency: UrgencyLevel;
  data: AnalysisResult;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  title,
  domain,
  urgency,
  data,
}) => {
  const [activeTab, setActiveTab] = useState<"memo" | "json">("memo");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const markdownContent = `# MAXLA EXECUTIVE MEMORANDUM
**CONFIDENTIAL & PRIVILEGED // FOR EXECUTIVE STEERING COMMITTEE**

## 1. Challenge & Strategic Context
- **Title:** ${title}
- **Domain:** ${domain}
- **Urgency Level:** ${urgency}
- **Date Synthesized:** ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
- **Strategic Governance:** Maxla Executive Decision Intelligence Engine

---

## 2. Executive Synthesis
${data.executiveSummary}

---

## 3. Problem Deconstruction & Root-Cause Architecture
### Surface Symptoms
${data.problemDeconstruction.primarySymptoms.map((s) => `- ${s}`).join("\n")}

### Underlying Root Causes
${data.problemDeconstruction.underlyingRootCauses
  .map((rc) => `- **[${rc.category}]** ${rc.cause}\n  *Impact:* ${rc.evidenceImpact}`)
  .join("\n")}

---

## 4. MECE Strategic Investigation Pillars
${data.mecePillars
  .map(
    (p, i) => `### Pillar 0${i + 1}: ${p.pillarName}
- **Working Hypothesis:** "${p.hypothesis}"
- **Key Inquiry Questions:**
${p.keyQuestions.map((q) => `  - ${q}`).join("\n")}
- **Highest-Leverage Structural Intervention:** ${p.leveragePoints}`
  )
  .join("\n\n")}

---

## 5. Decision Matrix & Strategic Options
${data.strategicOptions
  .map(
    (opt) => `### ${opt.name} (${opt.type})
- **Feasibility:** ${opt.feasibilityScore}/10 | **Impact:** ${opt.impactScore}/10 | **Risk:** ${opt.riskLevel}
- **Time to Value:** ${opt.timeToValueWeeks} Weeks | **Estimated CapEx:** ${opt.estimatedCapex}
- **Summary:** ${opt.description}
- **Key Advantages:**
${opt.pros.map((pr) => `  + ${pr}`).join("\n")}
- **Trade-offs:**
${opt.cons.map((cn) => `  - ${cn}`).join("\n")}`
  )
  .join("\n\n")}

### Selected Operating Option
**${data.recommendedStrategy.selectedOptionId}**
${data.recommendedStrategy.recommendationRationale}

- **Decisive Differentiators:**
${data.recommendedStrategy.decisiveDifferentiators.map((d) => `  * ${d}`).join("\n")}
- **Unintended Consequences Safeguard:** ${data.recommendedStrategy.unintendedConsequencesMitigation}

---

## 6. Execution Roadmap & Milestones
${data.executionRoadmap
  .map(
    (ph) => `### Phase 0${ph.phaseNumber}: ${ph.phaseName} (${ph.duration})
*Objective:* ${ph.objective}
*Exit Gate:* ${ph.exitGateCondition}

Workstreams:
${ph.workstreams.map((ws) => `- **[${ws.stream}]** ${ws.actionItem} (${ws.ownerRole}) -> Deliverable: ${ws.deliverable} [Status: ${ws.status || "pending"}]`).join("\n")}`
  )
  .join("\n\n")}

---

## 7. Enterprise Risk Heatmap & Tripwires
${data.riskHeatmap
  .map(
    (r) => `- **${r.riskTitle}** (Prob: ${r.probabilityScore}/5, Impact: ${r.impactScore}/5)
  *Mitigation Protocol:* ${r.mitigationProtocol}
  *Contingency Tripwire:* ${r.contingencyTrigger}`
  )
  .join("\n")}

---

## 8. Value Realization Ledger (Target OKRs)
${data.targetKpis
  .map((k) => `- **${k.metric}:** Baseline \`${k.baseline}\` → Target \`${k.target}\` (${k.timeframe}) [Current Progress: ${k.currentProgress || 0}%]`)
  .join("\n")}
`;

  const jsonContent = JSON.stringify(
    {
      title,
      domain,
      urgency,
      exportedAt: new Date().toISOString(),
      analysis: data,
    },
    null,
    2
  );

  const handleCopy = async () => {
    const textToCopy = activeTab === "memo" ? markdownContent : jsonContent;
    await copyToClipboard(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = activeTab === "memo" ? markdownContent : jsonContent;
    const extension = activeTab === "memo" ? "md" : "json";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `maxla-executive-brief-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Executive Briefing & Strategic Artifact Export
              </h2>
              <p className="text-xs text-slate-400">
                Generate formal Markdown briefings or JSON payload packets for C-Suite distribution.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Action Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("memo")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                activeTab === "memo"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive Memo (Markdown)</span>
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                activeTab === "json"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>JSON Data Packet</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Modal Body Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-indigo-600">
          {activeTab === "memo" ? markdownContent : jsonContent}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex justify-between items-center text-xs text-slate-400">
          <span>Maxla World-Class Strategic Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
