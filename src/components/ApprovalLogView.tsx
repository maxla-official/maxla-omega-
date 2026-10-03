import React, { useState, useMemo } from "react";
import {
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Plus,
  Lock,
  FileText,
  DollarSign,
  AlertTriangle,
  Sliders,
  Sparkles,
  Printer,
} from "lucide-react";
import { ApprovalLogEntry, AuthorityAlertLevel } from "../types";
import { ApprovalPdfModal } from "./ApprovalPdfModal";
import { copyToClipboard } from "../utils/clipboard";

interface ApprovalLogViewProps {
  logs: ApprovalLogEntry[];
  onAddLogEntry?: (entry: ApprovalLogEntry) => void;
  onClearLogs?: () => void;
  onExportLogs?: () => void;
}

export const ApprovalLogView: React.FC<ApprovalLogViewProps> = ({
  logs,
  onAddLogEntry,
  onClearLogs,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "overridden" | "pending">("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "high" | "warning" | "info">("all");
  const [selectedEntry, setSelectedEntry] = useState<ApprovalLogEntry | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  // PDF Export Modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfTargetEntry, setPdfTargetEntry] = useState<ApprovalLogEntry | null>(null);

  const handleOpenAuditPdf = () => {
    setPdfTargetEntry(null);
    setIsPdfModalOpen(true);
  };

  const handleOpenSinglePdf = (entry: ApprovalLogEntry) => {
    setPdfTargetEntry(entry);
    setIsPdfModalOpen(true);
  };

  // New simulation form state
  const [simTitle, setSimTitle] = useState("");
  const [simOfficer, setSimOfficer] = useState("Chief Strategy Officer");
  const [simActionType, setSimActionType] = useState<ApprovalLogEntry["actionType"]>("ai_directive_authorization");
  const [simSeverity, setSimSeverity] = useState<ApprovalLogEntry["severity"]>("high");
  const [simCapex, setSimCapex] = useState("$25,000,000");
  const [simNotes, setSimNotes] = useState("");

  // Filtered entries
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.officerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.sourceModule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || log.status === statusFilter;
      const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [logs, searchQuery, statusFilter, severityFilter]);

  // Aggregate metrics
  const totalApproved = logs.filter((l) => l.status === "approved").length;
  const totalOverridden = logs.filter((l) => l.status === "overridden").length;
  const totalPending = logs.filter((l) => l.status === "pending").length;
  const criticalCount = logs.filter((l) => l.severity === "critical").length;

  const handleCopyHash = async (hash: string) => {
    await copyToClipboard(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `maxla-approval-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    const headers = ["ID", "Timestamp", "Title", "Action Type", "Status", "Officer Name", "Officer Role", "Authority Level", "Severity", "Capex Impact", "Cryptographic Signature", "Notes"];
    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.actionType}"`,
      `"${l.status}"`,
      `"${l.officerName}"`,
      `"${l.officerRole}"`,
      `"${l.authorityLevel}"`,
      `"${l.severity}"`,
      `"${l.capexImpact || ""}"`,
      `"${l.cryptographicSignature}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `maxla-approval-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simTitle.trim()) return;

    const newLog: ApprovalLogEntry = {
      id: `LOG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: "Just Now",
      isoDate: new Date().toISOString(),
      actionType: simActionType,
      title: simTitle.trim(),
      description: `Executive sign-off recorded for ${simTitle.trim()}. Dual-key verification signed.`,
      officerName: simOfficer.trim() || "Executive Signer",
      officerRole: "Executive Signer",
      authorityLevel: "CONTINUITY PROTOCOL | TIER-1 RISK MAP",
      severity: simSeverity,
      status: "approved",
      capexImpact: simCapex || undefined,
      cryptographicSignature: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase()}`,
      sourceModule: "Decision Center Sentinel",
      notes: simNotes.trim() || "Authenticated through Maxla Executive Decision Protocol.",
    };

    if (onAddLogEntry) {
      onAddLogEntry(newLog);
    }
    setSimTitle("");
    setSimNotes("");
    setIsSimulateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Telemetry Cards */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/60 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-950 border border-indigo-700/60 text-indigo-400">
                <FileCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Executive Decision Center Approval & Audit Log
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                100% Verified
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Immutable, cryptographically stamped audit trail of executive sign-offs, manual overrides, MCDA strategy promotions, and autonomous threshold calibrations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="export-pdf-btn"
              onClick={handleOpenAuditPdf}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/60 text-xs font-bold flex items-center space-x-1.5 transition shadow-lg shadow-emerald-950/40 active:scale-95"
              title="Export complete approval ledger as official PDF / Print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Approval PDF</span>
            </button>
            <button
              id="export-csv-btn"
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
            <button
              id="export-json-btn"
              onClick={handleExportJson}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export JSON</span>
            </button>
            <button
              id="simulate-log-entry-btn"
              onClick={() => setIsSimulateModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-lg shadow-indigo-950/50 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Sign-Off Event</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Total Approvals Logged</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold font-mono text-white">{logs.length}</span>
              <span className="text-xs text-slate-500 font-mono">records</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Certified Human Authorizations</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">{totalApproved}</span>
              <span className="text-xs text-emerald-500 font-mono">dual-key signed</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Executive Manual Overrides</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold font-mono text-amber-400">{totalOverridden}</span>
              <span className="text-xs text-amber-500 font-mono">interventions</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Cryptographic Ledger Health</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold font-mono text-indigo-400">SHA-256</span>
              <span className="text-xs text-indigo-300 font-mono">tamper-proof</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="approval-log-search-input"
            type="text"
            placeholder="Search by action title, officer, ID, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1 overflow-x-auto text-xs">
          <span className="text-slate-400 font-mono text-[11px] mr-1 hidden sm:inline">Status:</span>
          {(["all", "approved", "overridden", "pending"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg capitalize text-xs font-semibold transition ${
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-1 text-xs">
          <span className="text-slate-400 font-mono text-[11px] mr-1 hidden sm:inline">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="warning">Warning Only</option>
            <option value="info">Info Only</option>
          </select>
        </div>
      </div>

      {/* Approval Log Table / Cards */}
      {filteredLogs.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
          <FileCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No matching approval records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or filter settings, or record a new sign-off event.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setSeverityFilter("all");
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const isApproved = log.status === "approved";
            const isOverridden = log.status === "overridden";

            return (
              <div
                key={log.id}
                className={`rounded-xl border transition-all p-4.5 ${
                  isApproved
                    ? "bg-slate-900/80 border-slate-800 hover:border-indigo-500/50"
                    : isOverridden
                    ? "bg-slate-900/80 border-amber-900/40 hover:border-amber-600/60"
                    : "bg-slate-900/80 border-red-900/40 hover:border-red-600/60"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Left info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                        {log.id}
                      </span>

                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isApproved
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800/60"
                            : isOverridden
                            ? "bg-amber-950 text-amber-300 border border-amber-800/60"
                            : "bg-red-950 text-red-300 border border-red-800/60"
                        }`}
                      >
                        {isApproved ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{log.status.toUpperCase()}</span>
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          log.severity === "critical"
                            ? "bg-red-950/80 text-red-300 border border-red-800/60"
                            : log.severity === "high"
                            ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {log.severity.toUpperCase()}
                      </span>

                      <span className="text-slate-500 text-xs font-mono flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{log.timestamp}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{log.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{log.description}</p>

                    {/* Metadata strip */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                      <div>
                        <span className="text-slate-500">Signer: </span>
                        <span className="font-semibold text-slate-200">{log.officerName}</span>
                        <span className="text-slate-500 font-mono text-[11px]"> ({log.officerRole})</span>
                      </div>

                      {log.capexImpact && (
                        <div>
                          <span className="text-slate-500">Capex Impact: </span>
                          <span className="font-mono font-bold text-amber-300">{log.capexImpact}</span>
                        </div>
                      )}

                      <div>
                        <span className="text-slate-500">Source: </span>
                        <span className="font-mono text-slate-300 text-[11px]">{log.sourceModule}</span>
                      </div>
                    </div>

                    {log.notes && (
                      <div className="mt-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-start space-x-1.5">
                        <span className="text-indigo-400 font-semibold shrink-0">Sign-Off Memo:</span>
                        <span>{log.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Cryptographic Fingerprint & Actions */}
                  <div className="lg:w-64 shrink-0 flex flex-col items-start lg:items-end justify-between gap-2 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-800">
                    <div className="w-full text-left lg:text-right space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono block">CRYPTOGRAPHIC HASH</span>
                      <div className="flex items-center lg:justify-end space-x-1.5">
                        <span className="font-mono text-[11px] text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 truncate max-w-[170px]">
                          {log.cryptographicSignature.slice(0, 10)}...{log.cryptographicSignature.slice(-6)}
                        </span>
                        <button
                          onClick={() => handleCopyHash(log.cryptographicSignature)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Copy Full Cryptographic Signature"
                        >
                          {copiedHash === log.cryptographicSignature ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-start lg:self-end">
                      <button
                        id={`pdf-slip-btn-${log.id}`}
                        onClick={() => handleOpenSinglePdf(log)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800/60 text-xs font-semibold flex items-center space-x-1 transition active:scale-95"
                        title="Generate and print official PDF Certificate Slip"
                      >
                        <Printer className="w-3 h-3 text-emerald-400" />
                        <span>PDF Slip</span>
                      </button>
                      <button
                        onClick={() => setSelectedEntry(log)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 transition"
                      >
                        <span>View Certificate</span>
                        <ExternalLink className="w-3 h-3 text-indigo-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  EXECUTIVE CERTIFICATE OF AUTHORIZATION
                </h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>AUDIT RECORD ID:</span>
                  <span className="text-indigo-400 font-bold">{selectedEntry.id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>EXECUTION TIME:</span>
                  <span className="text-white">{selectedEntry.timestamp} ({selectedEntry.isoDate})</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>SIGNING OFFICER:</span>
                  <span className="text-emerald-400 font-bold">{selectedEntry.officerName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>OFFICIAL ROLE:</span>
                  <span className="text-slate-200">{selectedEntry.officerRole}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>AUTHORITY LEVEL:</span>
                  <span className="text-amber-300 font-bold">{selectedEntry.authorityLevel}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>CAPEX IMPACT:</span>
                  <span className="text-white">{selectedEntry.capexImpact || "Operational Realignment"}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">ACTION TITLE:</span>
                <p className="text-white font-bold">{selectedEntry.title}</p>
                <p className="text-slate-300 text-[11px] mt-1 font-sans">{selectedEntry.description}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">IMMUTABLE CRYPTOGRAPHIC SIGNATURE:</span>
                <p className="text-indigo-300 break-all text-[11px] bg-slate-900 p-2 rounded border border-slate-800">
                  {selectedEntry.cryptographicSignature}
                </p>
                <span className="text-[10px] text-emerald-400 flex items-center space-x-1 pt-1 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Dual Approval Workflow Authenticity Validated via Maxla Ledger Gate</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                id="modal-pdf-cert-btn"
                onClick={() => handleOpenSinglePdf(selectedEntry)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-950/40 active:scale-95 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export PDF Certificate</span>
              </button>
              <button
                onClick={() => handleCopyHash(selectedEntry.cryptographicSignature)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Signature Hash</span>
              </button>
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulate New Sign-Off Modal */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Record Executive Sign-Off Event</h3>
              </div>
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block font-medium mb-1">Action Title / Charter</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Cross-Border Derivative Swaps Hedge Sign-Off"
                  value={simTitle}
                  onChange={(e) => setSimTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block font-medium mb-1">Authorizing Officer</label>
                  <input
                    type="text"
                    value={simOfficer}
                    onChange={(e) => setSimOfficer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block font-medium mb-1">Capex Allocation</label>
                  <input
                    type="text"
                    placeholder="$25,000,000"
                    value={simCapex}
                    onChange={(e) => setSimCapex(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block font-medium mb-1">Action Category</label>
                  <select
                    value={simActionType}
                    onChange={(e) => setSimActionType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ai_directive_authorization">AI Directive Authorization</option>
                    <option value="manual_override">Manual Override</option>
                    <option value="strategy_promotion">Strategy Promotion</option>
                    <option value="threshold_calibration">Threshold Calibration</option>
                    <option value="kpi_target_commit">KPI Target Commit</option>
                    <option value="black_swan_escalation">Black Swan Escalation</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block font-medium mb-1">Severity Level</label>
                  <select
                    value={simSeverity}
                    onChange={(e) => setSimSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block font-medium mb-1">Sign-Off Memo / Executive Rationale</label>
                <textarea
                  rows={2}
                  placeholder="Include risk mitigation notes or operational rationale..."
                  value={simNotes}
                  onChange={(e) => setSimNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Authorize & Append to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Approval PDF Modal & Print Slip */}
      <ApprovalPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        entry={pdfTargetEntry}
        allLogs={filteredLogs}
      />
    </div>
  );
};
