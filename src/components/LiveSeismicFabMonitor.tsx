import React, { useState, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  Compass,
  Radio,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useLiveTelemetry, LiveEarthquake } from "../context/LiveTelemetryContext";
import { tacticalSound } from "../utils/soundEffects";

interface LiveSeismicFabMonitorProps {
  onSelectQuake?: (quake: LiveEarthquake) => void;
  maxDisplay?: number;
}

export const LiveSeismicFabMonitor: React.FC<LiveSeismicFabMonitorProps> = ({
  onSelectQuake,
  maxDisplay = 20,
}) => {
  const { data, isLoading, isLive, refresh, latencyMs, lastUpdated } = useLiveTelemetry();
  const [filterMode, setFilterMode] = useState<"all" | "near-fabs" | "critical">("all");
  const [selectedQuakeId, setSelectedQuakeId] = useState<string | null>(null);

  const quakes = data.earthquakes || [];

  const filteredQuakes = useMemo(() => {
    return quakes.filter((q) => {
      if (filterMode === "critical") {
        return q.cleanroomRisk === "CRITICAL" || q.mag >= 5.0;
      }
      if (filterMode === "near-fabs") {
        return q.nearestFab && q.nearestFab.distanceKm < 1000;
      }
      return true;
    }).slice(0, maxDisplay);
  }, [quakes, filterMode, maxDisplay]);

  // Statistics
  const criticalCount = useMemo(
    () => quakes.filter((q) => q.cleanroomRisk === "CRITICAL" || q.mag >= 5.0).length,
    [quakes]
  );

  const nearFabCount = useMemo(
    () => quakes.filter((q) => q.nearestFab && q.nearestFab.distanceKm < 1000).length,
    [quakes]
  );

  const handleRefresh = async () => {
    tacticalSound.playPing();
    await refresh();
  };

  return (
    <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-rose-400">
              USGS Real-Time: {data.totalQuakesCount || quakes.length} Quakes Live
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              {latencyMs}ms Latency • Global 24h Feed
            </span>
            {data.nearestMalaccaQuake && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/60 text-amber-300">
                Nearest Malacca: {data.nearestMalaccaQuake.place} (M{data.nearestMalaccaQuake.mag})
              </span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <span>Semiconductor Fab Cleanroom Vibration Telemetry</span>
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterMode === "all"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All ({quakes.length})
            </button>
            <button
              onClick={() => setFilterMode("near-fabs")}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterMode === "near-fabs"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Near Fabs ({nearFabCount})
            </button>
            <button
              onClick={() => setFilterMode("critical")}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterMode === "critical"
                  ? "bg-rose-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Critical ({criticalCount})
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Force Sync USGS Live Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Real Cleanroom Tolerance Guide Banner */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>Cleanroom Sensitivity Threshold:</strong> ASML EUV High-NA lithography scanners (0.33 NA & 0.55 NA) automatically pause optical exposure if floor vibration exceeds <strong>0.1 µm/sec</strong>.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-mono text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>&lt;150km: High Alert</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>150-500km: Advisory</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>&gt;500km: Nominal</span>
          </span>
        </div>
      </div>

      {/* Earthquakes List */}
      <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0 z-10 text-[10px] uppercase">
            <tr>
              <th className="py-2.5 px-3">Magnitude</th>
              <th className="py-2.5 px-3">Location & Coordinates</th>
              <th className="py-2.5 px-3">Depth</th>
              <th className="py-2.5 px-3">Nearest Foundry / Chokepoint</th>
              <th className="py-2.5 px-3">Cleanroom Exposure</th>
              <th className="py-2.5 px-3 text-right">USGS Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 bg-slate-950">
            {filteredQuakes.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500">
                  {isLoading ? "Connecting to USGS real-time seismic feed..." : "No earthquakes match the selected filter criteria."}
                </td>
              </tr>
            ) : (
              filteredQuakes.map((quake) => {
                const isSelected = selectedQuakeId === quake.id;
                const timeAgoMin = Math.round((Date.now() - quake.time) / 60000);
                const timeAgoFormatted =
                  timeAgoMin < 60
                    ? `${timeAgoMin}m ago`
                    : `${Math.round(timeAgoMin / 60)}h ago`;

                const isNearTaiwan = quake.nearestFab?.fabCountry === "Taiwan";

                return (
                  <tr
                    key={quake.id}
                    onClick={() => {
                      setSelectedQuakeId(quake.id);
                      if (onSelectQuake) onSelectQuake(quake);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-slate-800 text-white"
                        : "hover:bg-slate-900/80 text-slate-300"
                    }`}
                  >
                    {/* Magnitude */}
                    <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                          quake.mag >= 5.0
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : quake.mag >= 3.5
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            quake.mag >= 5.0 ? "bg-rose-400 animate-ping" : "bg-amber-400"
                          }`}
                        />
                        <span>M {quake.mag.toFixed(1)}</span>
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white truncate max-w-xs">
                        {quake.place}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>{quake.coordinates[0].toFixed(2)}°N, {quake.coordinates[1].toFixed(2)}°E</span>
                        <span>•</span>
                        <span className="text-slate-400">{timeAgoFormatted}</span>
                      </div>
                    </td>

                    {/* Depth */}
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {quake.depthKm} km
                    </td>

                    {/* Nearest Fab */}
                    <td className="py-2.5 px-3">
                      {quake.nearestFab ? (
                        <div>
                          <div className={`font-semibold flex items-center gap-1 ${
                            isNearTaiwan ? "text-cyan-300" : "text-slate-200"
                          }`}>
                            <span>{quake.nearestFab.fabName}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            <strong>{quake.nearestFab.distanceKm} km</strong> away ({quake.nearestFab.fabCountry})
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Cleanroom Exposure Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          quake.cleanroomRisk === "CRITICAL"
                            ? "bg-rose-900/80 text-rose-200 border border-rose-700 animate-pulse"
                            : quake.cleanroomRisk === "ELEVATED"
                            ? "bg-amber-900/80 text-amber-200 border border-amber-700"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {quake.cleanroomRisk === "CRITICAL"
                          ? "TOOL PAUSE RISK"
                          : quake.cleanroomRisk === "ELEVATED"
                          ? "VIBRATION ADVISORY"
                          : "NOMINAL (< 0.1 µm)"}
                      </span>
                    </td>

                    {/* USGS Link */}
                    <td className="py-2.5 px-3 text-right">
                      {quake.url ? (
                        <a
                          href={quake.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-slate-800 transition"
                          title="View on USGS.gov"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
