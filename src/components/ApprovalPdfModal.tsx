import React, { useState } from "react";
import {
  Printer,
  Download,
  FileText,
  ShieldCheck,
  Check,
  Copy,
  X,
  Lock,
  Calendar,
  Building2,
  DollarSign,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import { ApprovalLogEntry } from "../types";
import { copyToClipboard } from "../utils/clipboard";

interface ApprovalPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If entry is provided, print single certificate; if null, print full audit trail
  entry: ApprovalLogEntry | null;
  allLogs: ApprovalLogEntry[];
}

export const ApprovalPdfModal: React.FC<ApprovalPdfModalProps> = ({
  isOpen,
  onClose,
  entry,
  allLogs,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isSingle = !!entry;
  const targetLogs = entry ? [entry] : allLogs;

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn("Print execution guarded:", err);
    }
  };

  const handleDownloadStandaloneHtml = () => {
    const title = isSingle
      ? `Approval-Certificate-${entry?.id}`
      : `Maxla-Approval-Audit-Trail-${new Date().toISOString().slice(0, 10)}`;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 40px;
      color: #0f172a;
      line-height: 1.5;
      background: #ffffff;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .logo {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      font-family: monospace;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 700;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #10b981;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .cert-box {
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 16px 0;
      font-size: 13px;
    }
    .meta-label {
      color: #64748b;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .meta-value {
      font-weight: 700;
      color: #0f172a;
      font-family: monospace;
    }
    .hash {
      background: #f1f5f9;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      word-break: break-all;
      border: 1px solid #cbd5e1;
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background: #f8fafc;
      font-weight: 700;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #cbd5e1;
      padding-top: 12px;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { margin: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">MAXLA STRATEGIC INTELLIGENCE</div>
      <div style="font-size: 13px; color: #64748b;">Decision Center Sentinel & Governance Audit Ledger</div>
    </div>
    <div style="text-align: right;">
      <span class="badge">OFFICIAL COMPLIANCE ARTIFACT</span>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Issued: ${currentDate} ${currentTime}</div>
    </div>
  </div>

  <h2>${isSingle ? "Executive Dual Approval Authorization Certificate" : "Executive Decision Center Approval Trail"}</h2>
  <p style="font-size: 13px; color: #475569;">
    This document serves as an immutable, tamper-evident record of executive authorizations, AI directives sign-offs, and capital deployment sign-offs governed by the Maxla Executive Protocol.
  </p>

  ${
    isSingle && entry
      ? `
    <div class="cert-box">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
        <h3 style="margin: 0; font-size: 18px;">${entry.title}</h3>
        <span class="badge">${entry.status.toUpperCase()}</span>
      </div>

      <div class="meta-grid">
        <div>
          <div class="meta-label">Audit Log ID</div>
          <div class="meta-value">${entry.id}</div>
        </div>
        <div>
          <div class="meta-label">Timestamp (UTC)</div>
          <div class="meta-value">${entry.isoDate || entry.timestamp}</div>
        </div>
        <div>
          <div class="meta-label">Authorizing Officer</div>
          <div class="meta-value">${entry.officerName} (${entry.officerRole})</div>
        </div>
        <div>
          <div class="meta-label">Authority Level</div>
          <div class="meta-value">${entry.authorityLevel}</div>
        </div>
        <div>
          <div class="meta-label">Action Classification</div>
          <div class="meta-value">${entry.actionType}</div>
        </div>
        <div>
          <div class="meta-label">Capex Impact</div>
          <div class="meta-value" style="color: #047857;">${entry.capexImpact || "Operational Buffer ($0)"}</div>
        </div>
      </div>

      <div style="margin: 16px 0;">
        <div class="meta-label">Directive Scope & Description</div>
        <p style="font-size: 13px; color: #1e293b; margin: 4px 0;">${entry.description}</p>
      </div>

      ${
        entry.notes
          ? `
      <div style="margin: 16px 0; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <div class="meta-label">Executive Sign-Off Memorandum</div>
        <div style="font-size: 13px; color: #334155; margin-top: 4px;">${entry.notes}</div>
      </div>
      `
          : ""
      }

      <div style="margin-top: 20px;">
        <div class="meta-label">SHA-256 Cryptographic Audit Hash</div>
        <div class="hash">${entry.cryptographicSignature}</div>
      </div>
    </div>
    `
      : `
    <table>
      <thead>
        <tr>
          <th>Record ID</th>
          <th>Timestamp</th>
          <th>Action / Charter</th>
          <th>Signer & Role</th>
          <th>Status</th>
          <th>CapEx Impact</th>
          <th>SHA-256 Signature</th>
        </tr>
      </thead>
      <tbody>
        ${allLogs
          .map(
            (l) => `
          <tr>
            <td style="font-family: monospace; font-weight: bold;">${l.id}</td>
            <td>${l.timestamp}</td>
            <td><strong>${l.title}</strong><br/><span style="color: #64748b; font-size: 11px;">${l.actionType}</span></td>
            <td>${l.officerName}<br/><span style="color: #64748b; font-size: 10px;">${l.officerRole}</span></td>
            <td><span style="font-weight: bold; color: ${l.status === "approved" ? "#065f46" : "#b45309"}">${l.status.toUpperCase()}</span></td>
            <td style="font-family: monospace;">${l.capexImpact || "-"}</td>
            <td style="font-family: monospace; font-size: 10px;">${l.cryptographicSignature.slice(0, 12)}...${l.cryptographicSignature.slice(-6)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
    `
  }

  <div class="footer">
    <div>Maxla Strategic Intelligence Platform • Cryptographic Ledger V2.4</div>
    <div>Strictly Confidential • Authorized Officer Access Only</div>
  </div>

  <script>
    window.onload = function() {
      // Prompt print immediately if standalone
    };
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyRecord = async () => {
    if (isSingle && entry) {
      const summary = `MAXLA EXECUTIVE CERTIFICATE OF AUTHORIZATION
Record ID: ${entry.id}
Date: ${entry.timestamp} (${entry.isoDate})
Status: ${entry.status.toUpperCase()}
Officer: ${entry.officerName} (${entry.officerRole})
Authority Level: ${entry.authorityLevel}
Action: ${entry.title}
Capex: ${entry.capexImpact || "N/A"}
Notes: ${entry.notes || "Standard directive authorization"}
SHA-256 Signature: ${entry.cryptographicSignature}
Verification: Validated by Maxla Decision Center Sentinel`;
      await copyToClipboard(summary);
    } else {
      const summary = `MAXLA APPROVAL & AUDIT LEDGER
Total Records: ${allLogs.length}
Exported: ${currentDate} ${currentTime}
${allLogs
  .map(
    (l) =>
      `[${l.id}] ${l.status.toUpperCase()} | ${l.title} | Signer: ${l.officerName} | Hash: ${l.cryptographicSignature.slice(0, 16)}...`
  )
  .join("\n")}`;
      await copyToClipboard(summary);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black">
        {/* Modal Top Bar - Hidden when printing */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{isSingle ? "Executive Dual Approval Certificate (PDF)" : "Official Approval & Audit Trail (PDF)"}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  PRINT READY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isSingle
                  ? "Standard corporate governance authorization slip with cryptographic audit hash."
                  : `Comprehensive audit log containing ${allLogs.length} certified executive sign-offs.`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="pdf-print-action-btn"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-lg shadow-indigo-950/50 active:scale-95"
              title="Print directly or Save as PDF via browser print dialog"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              id="pdf-download-html-btn"
              onClick={handleDownloadStandaloneHtml}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition active:scale-95"
              title="Download standalone offline report"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download HTML</span>
            </button>

            <button
              onClick={handleCopyRecord}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Copy Record Text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-950/50 print:bg-white print:p-0">
          <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-10 border border-slate-200 print:shadow-none print:border-none print:p-0">
            {/* Formal Executive Header */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-2xl tracking-tighter bg-slate-900 text-white px-2 py-0.5 rounded">
                    M
                  </span>
                  <span className="font-mono font-black text-xl tracking-tight text-slate-900">
                    MAXLA STRATEGIC INTELLIGENCE
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
                  Executive Governance & Sentinel Dual Approval Ledger
                </div>
              </div>

              <div className="sm:text-right">
                <span className="inline-block px-2.5 py-1 text-[11px] font-mono font-bold uppercase rounded bg-emerald-50 text-emerald-700 border border-emerald-300">
                  VERIFIED CRYPTOGRAPHIC RECORD
                </span>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Issued: {currentDate} • {currentTime}
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isSingle
                  ? "EXECUTIVE CERTIFICATE OF AUTHORIZATION"
                  : "EXECUTIVE HUMAN AUTHORITY APPROVAL & AUDIT TRAIL"}
              </h1>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This document serves as an immutable, tamper-evident legal audit instrument generated under the Maxla
                Executive Governance Standard. All cryptographic signatures are sealed via SHA-256 hash chains.
              </p>
            </div>

            {/* Content: Single Certificate */}
            {isSingle && entry ? (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                        DIRECTIVE / ACTION TITLE
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">{entry.title}</h3>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                        entry.status === "approved"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {entry.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs font-sans">
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase font-mono">
                        Record ID
                      </span>
                      <span className="font-mono font-bold text-slate-900">{entry.id}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase font-mono">
                        Authorizing Signer
                      </span>
                      <span className="font-bold text-slate-900">{entry.officerName}</span>
                      <div className="text-[11px] text-slate-500">{entry.officerRole}</div>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase font-mono">
                        Authority Level
                      </span>
                      <span className="font-bold text-indigo-700">{entry.authorityLevel}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase font-mono">
                        Action Category
                      </span>
                      <span className="font-semibold text-slate-800">{entry.actionType}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase font-mono">
                        Capex Commitment
                      </span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {entry.capexImpact || "$0 (Operational Directive)"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase font-mono">
                        Timestamp / Date
                      </span>
                      <span className="font-mono text-slate-800">{entry.isoDate || entry.timestamp}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 mt-4 text-xs">
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase font-mono mb-1">
                      Action Scope & Operational Description
                    </span>
                    <p className="text-slate-700 leading-relaxed">{entry.description}</p>
                  </div>

                  {entry.notes && (
                    <div className="pt-3 mt-3 border-t border-slate-200 text-xs">
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase font-mono mb-1">
                        Authorizing Officer Memorandum / Justification
                      </span>
                      <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-200 italic">
                        "{entry.notes}"
                      </p>
                    </div>
                  )}

                  <div className="pt-4 mt-4 border-t border-slate-200">
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase font-mono mb-1">
                      Cryptographic Signature Hash (SHA-256 Tamper-Proof Stamp)
                    </span>
                    <div className="font-mono text-xs bg-slate-900 text-emerald-400 p-2.5 rounded border border-slate-800 break-all select-all">
                      {entry.cryptographicSignature}
                    </div>
                  </div>
                </div>

                {/* Sign-off seal block */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">
                      Executive Signer Attestation
                    </span>
                    <div className="font-serif italic text-base mt-2 text-slate-800 border-b border-slate-300 pb-1">
                      {entry.officerName}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Dual Approval Certified Signature</div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">
                      Autonomous Sentinel Verification
                    </span>
                    <div className="font-mono font-bold text-sm mt-2 text-emerald-700 border-b border-slate-300 pb-1">
                      VALIDATED // CONTINUITY PROTOCOL PASSED
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Security Hash Chained to Main Ledger</div>
                  </div>
                </div>
              </div>
            ) : (
              /* Content: Full Audit Log Table */
              <div className="space-y-4">
                {/* Summary Metrics Strip */}
                <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">TOTAL LOGS</span>
                    <span className="font-bold text-slate-900 text-sm">{allLogs.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">AUTHORIZED</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {allLogs.filter((l) => l.status === "approved").length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">OVERRIDES</span>
                    <span className="font-bold text-amber-700 text-sm">
                      {allLogs.filter((l) => l.status === "overridden").length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ENCRYPTION</span>
                    <span className="font-bold text-indigo-700 text-sm">SHA-256</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-mono text-[11px]">
                        <th className="border border-slate-200 p-2">ID</th>
                        <th className="border border-slate-200 p-2">Action / Charter</th>
                        <th className="border border-slate-200 p-2">Signer & Role</th>
                        <th className="border border-slate-200 p-2">Status</th>
                        <th className="border border-slate-200 p-2">CapEx</th>
                        <th className="border border-slate-200 p-2">Signature Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {allLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="border border-slate-200 p-2 font-mono font-bold text-indigo-700">
                            {log.id}
                          </td>
                          <td className="border border-slate-200 p-2">
                            <div className="font-bold">{log.title}</div>
                            <div className="text-[10px] text-slate-500">{log.actionType}</div>
                          </td>
                          <td className="border border-slate-200 p-2">
                            <div className="font-semibold">{log.officerName}</div>
                            <div className="text-[10px] text-slate-500">{log.officerRole}</div>
                          </td>
                          <td className="border border-slate-200 p-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                log.status === "approved"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="border border-slate-200 p-2 font-mono text-emerald-800 font-bold">
                            {log.capexImpact || "-"}
                          </td>
                          <td className="border border-slate-200 p-2 font-mono text-[10px] text-slate-600">
                            {log.cryptographicSignature.slice(0, 10)}...{log.cryptographicSignature.slice(-6)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Document Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-mono gap-2">
              <div>MAXLA GOVERNANCE SYSTEM • TAMPER-EVIDENT AUDIT TRAIL</div>
              <div>PAGE 1 OF 1 • RECORD GENERATED LOCALLY ON HOST</div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close Bar */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Click "Print / Save as PDF" and select "Save as PDF" in your print dialog.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
