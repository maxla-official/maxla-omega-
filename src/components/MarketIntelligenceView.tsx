import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  Search,
  Filter,
  BarChart2,
  DollarSign,
  Globe,
  Plus
} from "lucide-react";
import { TickerAsset } from "../types";
import { TickerSparkline } from "./TickerSparkline";
import { AssetDetailModal } from "./AssetDetailModal";
import { AddAssetModal } from "./AddAssetModal";
import { useLiveTelemetry } from "../context/LiveTelemetryContext";

interface MarketIntelligenceViewProps {
  assets: TickerAsset[];
  onSelectForStrategy?: (asset: TickerAsset) => void;
  onAddAsset?: (newAsset: TickerAsset) => void;
}

export const MarketIntelligenceView: React.FC<MarketIntelligenceViewProps> = ({
  assets,
  onSelectForStrategy,
  onAddAsset,
}) => {
  const { data: liveTelemetry } = useLiveTelemetry();
  const [selectedAsset, setSelectedAsset] = useState<TickerAsset | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssets = assets.filter((asset) => {
    const matchesCat = filterCategory === "all" || asset.category === filterCategory;
    const matchesQuery =
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Top gainers and losers
  const sortedByPerf = [...assets].sort((a, b) => b.changePercent - a.changePercent);
  const topGainers = sortedByPerf.slice(0, 3);
  const topLosers = [...sortedByPerf].reverse().slice(0, 3);

  return (
    <div id="market-intelligence-view" className="space-y-6">
      {/* Top Strategic Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Feed Streaming
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {assets.length} Active Instruments Monitored
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Global Market Intelligence & Macro Volatility Terminal
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Real-time multi-asset financial benchmark telemetry. Directly link macro commodity spikes, sovereign yield curve shifts, foreign exchange adjustments, and tech equity multiples to Maxla&apos;s corporate strategy deconstruction engine.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="market-view-add-asset-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Instrument</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Top Gainer Today</div>
            {topGainers[0] && (
              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <span className="font-bold text-white text-sm">{topGainers[0].symbol}</span>
                  <span className="text-xs text-slate-400 ml-1.5 font-mono">{topGainers[0].currency}{topGainers[0].price.toLocaleString()}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 font-mono">+{topGainers[0].changePercent.toFixed(2)}%</span>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Leading Asset Retreat</div>
            {topLosers[0] && (
              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <span className="font-bold text-white text-sm">{topLosers[0].symbol}</span>
                  <span className="text-xs text-slate-400 ml-1.5 font-mono">{topLosers[0].currency}{topLosers[0].price.toLocaleString()}</span>
                </div>
                <span className="text-xs font-bold text-rose-400 font-mono">{topLosers[0].changePercent.toFixed(2)}%</span>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">10Y Benchmark Hurdle</div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-bold text-white text-sm">US10Y</span>
              <span className="text-xs font-bold text-indigo-300 font-mono">4.28% Yield</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Energy Choke Point (Live Futures)</div>
            {(() => {
              const brent = assets.find((a) => a.symbol === "BZ=F" || a.symbol === "BRENT");
              const price = brent ? brent.price.toFixed(2) : "101.19";
              const change = brent ? brent.changePercent : -3.89;
              return (
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-bold text-white text-sm">Brent Crude (BZ=F)</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="font-bold text-emerald-400">${price} / bbl</span>
                    <span className={change >= 0 ? "text-emerald-400 text-[10px]" : "text-rose-400 text-[10px]"}>
                      ({change >= 0 ? "+" : ""}{change.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Real-Time Central Bank FX & Semiconductor Inflation Telemetry */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-bold uppercase">Real Central Bank Cross-Rates:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
              USD/EUR: <strong className="text-emerald-400">${liveTelemetry?.fxRates?.EUR || 1.0838}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
              USD/JPY: <strong className="text-amber-400">¥{liveTelemetry?.fxRates?.JPY || 152.65}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
              USD/INR: <strong className="text-indigo-400">₹{liveTelemetry?.fxRates?.INR || 86.85}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
              USD/TWD: <strong className="text-cyan-400">NT${liveTelemetry?.fxRates?.TWD || 32.15}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "all", label: "All Instruments" },
            { id: "indices", label: "Indices" },
            { id: "equities", label: "Equities" },
            { id: "commodities", label: "Commodities" },
            { id: "rates", label: "Rates" },
            { id: "crypto", label: "Crypto" },
            { id: "fx", label: "FX" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                filterCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search symbol or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Main Assets Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Instrument</th>
                <th className="py-3.5 px-4 text-right">Price</th>
                <th className="py-3.5 px-4 text-right">24h Change</th>
                <th className="py-3.5 px-4 text-right hidden md:table-cell">24h Range</th>
                <th className="py-3.5 px-4 text-center">Trend (Sparkline)</th>
                <th className="py-3.5 px-4 text-right hidden lg:table-cell">Volume</th>
                <th className="py-3.5 px-4 text-center">Executive Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredAssets.map((asset) => {
                const isPositive = asset.changePercent >= 0;
                return (
                  <tr
                    key={asset.symbol}
                    id={`market-table-row-${asset.symbol}`}
                    onClick={() => setSelectedAsset(asset)}
                    className="hover:bg-slate-800/40 cursor-pointer transition group"
                  >
                    {/* Symbol & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0">
                          {asset.symbol.substring(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white group-hover:text-indigo-300 transition">
                              {asset.symbol}
                            </span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {asset.category}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 line-clamp-1">{asset.name}</span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono font-bold text-white text-sm">
                        {asset.currency}
                        {asset.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: asset.price < 10 ? 4 : 2,
                        })}
                        {asset.unit && <span className="text-xs text-slate-400 ml-1">{asset.unit}</span>}
                      </div>
                    </td>

                    {/* Change */}
                    <td className="py-3 px-4 text-right">
                      <div
                        className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md ${
                          isPositive ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40" : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>
                          {isPositive ? "+" : ""}
                          {asset.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    {/* 24h Range */}
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400 hidden md:table-cell">
                      <span>{asset.currency}{asset.low24h.toLocaleString()}</span>
                      <span className="mx-1 text-slate-600">-</span>
                      <span>{asset.currency}{asset.high24h.toLocaleString()}</span>
                    </td>

                    {/* Sparkline */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex justify-center">
                        <TickerSparkline data={asset.sparkline} isPositive={isPositive} width={64} height={24} />
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-4 text-right font-mono text-slate-300 hidden lg:table-cell">
                      {asset.volume}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedAsset(asset)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          Deep Dive
                        </button>
                        {onSelectForStrategy && (
                          <button
                            onClick={() => onSelectForStrategy(asset)}
                            title="Deconstruct Macro Impact in Maxla"
                            className="p-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onSelectForStrategy={onSelectForStrategy}
        />
      )}

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <AddAssetModal
          currentAssets={assets}
          onClose={() => setIsAddModalOpen(false)}
          onAddAsset={(newAsset) => {
            if (onAddAsset) onAddAsset(newAsset);
            setIsAddModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
