import React, { useState, useMemo } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  ShieldAlert,
  ArrowUpRight,
  Maximize2,
  Calendar,
  Sparkles
} from "lucide-react";
import { TickerAsset } from "../types";

interface AssetDetailModalProps {
  asset: TickerAsset | null;
  onClose: () => void;
  onSelectForStrategy?: (asset: TickerAsset) => void;
}

type Timeframe = "1H" | "1D" | "1W" | "1M" | "1Y";

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
  onSelectForStrategy,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!asset) return null;

  const isPositive = asset.changePercent >= 0;

  // Generate synthetic high-density curve for selected timeframe
  const chartData = useMemo(() => {
    const pointsCount = timeframe === "1H" ? 18 : timeframe === "1D" ? 30 : timeframe === "1W" ? 42 : timeframe === "1M" ? 50 : 60;
    const base = asset.price;
    const variance = timeframe === "1H" ? 0.008 : timeframe === "1D" ? 0.02 : timeframe === "1W" ? 0.05 : timeframe === "1M" ? 0.12 : 0.25;

    const points: number[] = [];
    let current = base * (1 - (isPositive ? variance * 0.7 : -variance * 0.7));
    
    // Seed with a deterministic pseudo-random walk
    for (let i = 0; i < pointsCount - 1; i++) {
      points.push(current);
      const step = (Math.sin(i * 0.9) * 0.6 + (Math.random() - 0.48)) * (base * variance * 0.15);
      current += step;
    }
    // Final point is the exact live price
    points.push(asset.price);
    return points;
  }, [asset.symbol, asset.price, timeframe, isPositive]);

  const minPrice = Math.min(...chartData);
  const maxPrice = Math.max(...chartData);
  const priceRange = maxPrice - minPrice || 1;

  // SVG Chart Dimensions
  const svgWidth = 640;
  const svgHeight = 220;
  const padX = 20;
  const padY = 24;
  const graphWidth = svgWidth - padX * 2;
  const graphHeight = svgHeight - padY * 2;

  const points = chartData.map((val, idx) => {
    const x = padX + (idx / (chartData.length - 1)) * graphWidth;
    const y = padY + graphHeight - ((val - minPrice) / priceRange) * graphHeight;
    return { x, y, val };
  });

  const pathD = `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")}`;
  const areaD = `${pathD} L ${padX + graphWidth},${svgHeight - padY} L ${padX},${svgHeight - padY} Z`;

  const hoveredPoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  // 52-week mock range
  const range52Low = (asset.low24h * 0.82).toFixed(2);
  const range52High = (asset.high24h * 1.28).toFixed(2);

  // Day range progress
  const dayRangeSpread = asset.high24h - asset.low24h || 1;
  const currentPositionPct = Math.min(
    100,
    Math.max(0, ((asset.price - asset.low24h) / dayRangeSpread) * 100)
  );

  return (
    <div
      id="asset-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="asset-detail-modal-card"
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-base">
              {asset.symbol.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">{asset.symbol}</h3>
                <span className="px-2 py-0.5 text-xs font-medium uppercase tracking-wider rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {asset.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Feed
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{asset.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="close-asset-modal-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Main Price & Status Banner */}
          <div className="flex flex-wrap items-baseline justify-between gap-4 bg-slate-950/40 border border-slate-800/60 rounded-xl p-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Real-Time Price</div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-bold text-white tracking-tight font-mono">
                  {asset.currency}
                  {asset.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: asset.price < 10 ? 4 : 2,
                  })}
                  {asset.unit && <span className="text-sm font-normal text-slate-400 ml-1">{asset.unit}</span>}
                </span>

                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold ${
                    isPositive ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40" : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>
                    {isPositive ? "+" : ""}
                    {asset.changePercent.toFixed(2)}%
                  </span>
                  <span className="text-xs font-mono opacity-80">
                    ({isPositive ? "+" : ""}
                    {asset.change.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>

            {/* Timeframe Buttons */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(["1H", "1D", "1W", "1M", "1Y"] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  id={`timeframe-btn-${tf}`}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                    timeframe === tf
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="relative bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Performance Horizon ({timeframe})
              </span>
              {hoveredPoint ? (
                <div className="flex items-center gap-2 bg-indigo-950/70 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-700/50 font-mono text-xs">
                  <span>Inspection:</span>
                  <span className="font-bold text-white">
                    {asset.currency}
                    {hoveredPoint.val.toFixed(asset.price < 10 ? 4 : 2)}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-500">Hover crosshair over chart to inspect points</span>
              )}
            </div>

            <div className="relative w-full h-[220px] overflow-hidden">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full cursor-crosshair"
                onMouseLeave={() => setHoverIndex(null)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mouseX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
                  const index = Math.round(ratio * (points.length - 1));
                  setHoverIndex(index);
                }}
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Grid Lines */}
                <line x1={padX} y1={padY} x2={padX + graphWidth} y2={padY} stroke="#334155" strokeDasharray="3 3" strokeOpacity={0.4} />
                <line x1={padX} y1={padY + graphHeight / 2} x2={padX + graphWidth} y2={padY + graphHeight / 2} stroke="#334155" strokeDasharray="3 3" strokeOpacity={0.3} />
                <line x1={padX} y1={padY + graphHeight} x2={padX + graphWidth} y2={padY + graphHeight} stroke="#334155" strokeDasharray="3 3" strokeOpacity={0.4} />

                {/* Min / Max Labels */}
                <text x={padX} y={padY - 8} fill="#64748b" fontSize="10" fontFamily="monospace">
                  High: {asset.currency}{maxPrice.toFixed(asset.price < 10 ? 3 : 2)}
                </text>
                <text x={padX} y={svgHeight - 4} fill="#64748b" fontSize="10" fontFamily="monospace">
                  Low: {asset.currency}{minPrice.toFixed(asset.price < 10 ? 3 : 2)}
                </text>

                {/* Gradient Fill */}
                <path d={areaD} fill="url(#chartGradient)" />

                {/* Main Curve Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isPositive ? "#10b981" : "#f43f5e"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Hover indicator crosshair */}
                {hoveredPoint && (
                  <g>
                    <line
                      x1={hoveredPoint.x}
                      y1={padY}
                      x2={hoveredPoint.x}
                      y2={padY + graphHeight}
                      stroke="#818cf8"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    <circle
                      cx={hoveredPoint.x}
                      cy={hoveredPoint.y}
                      r="5"
                      fill="#818cf8"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Intraday Day Range Slider */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Day Low: <strong className="text-white font-mono">{asset.currency}{asset.low24h.toLocaleString()}</strong></span>
              <span className="font-medium text-slate-300">Intraday Trading Range</span>
              <span>Day High: <strong className="text-white font-mono">{asset.currency}{asset.high24h.toLocaleString()}</strong></span>
            </div>
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${isPositive ? "bg-emerald-500" : "bg-rose-500"}`}
                style={{ width: `${currentPositionPct}%` }}
              />
            </div>
          </div>

          {/* Financial & Fundamental Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Market Cap / Scale</div>
              <div className="text-sm font-bold text-white mt-1 font-mono">{asset.marketCap || "N/A"}</div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">24h Volume</div>
              <div className="text-sm font-bold text-white mt-1 font-mono">{asset.volume}</div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">P/E Ratio</div>
              <div className="text-sm font-bold text-white mt-1 font-mono">{asset.peRatio || "N/A"}</div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Yield / Distribution</div>
              <div className="text-sm font-bold text-white mt-1 font-mono">{asset.dividendYield || "N/A"}</div>
            </div>
          </div>

          {/* Executive Strategic Macro Insight */}
          {asset.executiveInsight && (
            <div className="bg-indigo-950/30 border border-indigo-800/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Maxla Strategic & Enterprise Risk Analysis
              </div>
              <p className="text-xs text-indigo-100/90 leading-relaxed">
                {asset.executiveInsight}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <div className="text-xs text-slate-500">
            Last tick received: <span className="font-mono text-slate-400">{new Date(asset.lastUpdate).toLocaleTimeString()}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="dismiss-asset-modal-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Close
            </button>
            {onSelectForStrategy && (
              <button
                id="solve-with-asset-btn"
                onClick={() => {
                  onSelectForStrategy(asset);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/20 transition"
              >
                <span>Deconstruct Macro Impact in Maxla</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
