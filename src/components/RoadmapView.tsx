import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  UserCheck,
  ShieldCheck,
  Flag,
} from "lucide-react";
import { ExecutionPhase, WorkstreamAction } from "../types";

interface RoadmapViewProps {
  roadmap: ExecutionPhase[];
  onUpdateActionStatus?: (phaseIndex: number, actionIndex: number, newStatus: WorkstreamAction["status"]) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ roadmap, onUpdateActionStatus }) => {
  const [selectedStream, setSelectedStream] = useState<string>("All");
  const [localRoadmap, setLocalRoadmap] = useState<ExecutionPhase[]>(roadmap);

  // Sync if props update
  React.useEffect(() => {
    setLocalRoadmap(roadmap);
  }, [roadmap]);

  // Extract all distinct workstreams
  const allStreams = React.useMemo(() => {
    const streams = new Set<string>();
    localRoadmap.forEach((phase) => {
      phase.workstreams.forEach((ws) => streams.add(ws.stream));
    });
    return ["All", ...Array.from(streams)];
  }, [localRoadmap]);

  const handleStatusCycle = (phaseIdx: number, actionIdx: number) => {
    const current = localRoadmap[phaseIdx].workstreams[actionIdx].status || "pending";
    const next: WorkstreamAction["status"] =
      current === "pending"
        ? "in_progress"
        : current === "in_progress"
        ? "completed"
        : current === "completed"
        ? "blocked"
        : "pending";

    const updated = [...localRoadmap];
    updated[phaseIdx].workstreams[actionIdx].status = next;
    setLocalRoadmap(updated);

    if (onUpdateActionStatus) {
      onUpdateActionStatus(phaseIdx, actionIdx, next);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Filter */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Execution Roadmap & Milestone Orchestrator
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Multi-phase workstream governance with verified exit gate conditions. Click any task status badge to toggle progression.
          </p>
        </div>

        {/* Workstream Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {allStreams.map((stream) => (
            <button
              key={stream}
              onClick={() => setSelectedStream(stream)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedStream === stream
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {stream}
            </button>
          ))}
        </div>
      </div>

      {/* Phases Accordion / List */}
      <div className="space-y-6">
        {localRoadmap.map((phase, pIdx) => {
          const totalItems = phase.workstreams.length;
          const completedCount = phase.workstreams.filter(
            (w) => w.status === "completed"
          ).length;
          const progressPct = totalItems ? Math.round((completedCount / totalItems) * 100) : 0;

          const filteredWorkstreams =
            selectedStream === "All"
              ? phase.workstreams
              : phase.workstreams.filter((w) => w.stream === selectedStream);

          return (
            <div
              key={phase.phaseNumber || pIdx}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-lg"
            >
              {/* Phase Header */}
              <div className="p-5 sm:p-6 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                      Phase 0{phase.phaseNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Duration: {phase.duration}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {phase.phaseName}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {phase.objective}
                  </p>
                </div>

                {/* Progress Bar & Counter */}
                <div className="sm:w-56 shrink-0 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Milestone Progress</span>
                    <span className="text-indigo-400 font-bold">{progressPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block text-right">
                    {completedCount} of {totalItems} Workstreams Completed
                  </span>
                </div>
              </div>

              {/* Workstream Action Items Table */}
              <div className="p-5 sm:p-6 space-y-3">
                {filteredWorkstreams.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No workstreams in this phase match the selected filter.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {filteredWorkstreams.map((action, aIdx) => {
                      const status = action.status || "pending";
                      return (
                        <div
                          key={aIdx}
                          className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {action.stream}
                              </span>
                              <div className="flex items-center text-[11px] text-slate-400 space-x-1">
                                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{action.ownerRole}</span>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-slate-100">
                              {action.actionItem}
                            </p>
                            <p className="text-xs text-slate-400">
                              <span className="font-medium text-slate-300">Deliverable:</span>{" "}
                              {action.deliverable}
                            </p>
                          </div>

                          {/* Status Toggle Badge */}
                          <button
                            onClick={() => handleStatusCycle(pIdx, aIdx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center space-x-1.5 shrink-0 transition-all ${
                              status === "completed"
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
                                : status === "in_progress"
                                ? "bg-indigo-950/80 text-indigo-300 border-indigo-700/60"
                                : status === "blocked"
                                ? "bg-rose-950/80 text-rose-300 border-rose-700/60"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {status === "completed" && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            {status === "in_progress" && (
                              <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                            )}
                            {status === "blocked" && (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                            )}
                            <span className="capitalize">
                              {status.replace("_", " ")}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Exit Gate Condition */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/90 border border-indigo-900/50 flex items-start space-x-2.5 text-xs text-slate-300">
                  <Flag className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
                      Phase Exit Gate Condition:
                    </span>
                    <span>{phase.exitGateCondition}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
