import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Plus,
  SlidersHorizontal,
  LayoutGrid,
  Radio,
  Volume2,
  VolumeX,
  RotateCw,
  ChevronRight,
  Maximize2,
  ExternalLink,
  Zap,
  Activity,
  Sparkles,
} from "lucide-react";
import { TickerAsset, AssetCategory } from "../types";
import { INITIAL_TICKER_ASSETS } from "../data/marketData";
import { TickerSparkline } from "./TickerSparkline";
import { AssetDetailModal } from "./AssetDetailModal";
import { AddAssetModal } from "./AddAssetModal";

export interface LiveTickTelemetry {
  symbol: string;
  name: string;
  price: number;
  delta: number;
  changePercent: number;
  direction: "up" | "down";
  timestamp: number;
  tickId: number;
}

interface LivePriceTickerProps {
  onSelectForStrategy?: (asset: TickerAsset) => void;
}

export const LivePriceTicker: React.FC<LivePriceTickerProps> = ({
  onSelectForStrategy,
}) => {
  const [assets, setAssets] = useState<TickerAsset[]>(() => {
    // Attempt local storage hydration
    try {
      const saved = localStorage.getItem("maxla_ticker_assets");
      if (saved) {
        const parsed = JSON.parse(saved);
        const allowed = ['TSM', 'ASML', 'NVDA', 'AMAT', 'LRCX', 'GFS', 'ASX', 'MP', 'INTC'];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((a) => allowed.includes(a.symbol));
          if (valid.length === 9) {
            return valid;
          }
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_TICKER_ASSETS;
  });

  const [activeCategory, setActiveCategory] = useState<AssetCategory>("all");
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<0.5 | 1 | 2 | 4>(1);
  const [viewMode, setViewMode] = useState<"tape" | "grid">("tape");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<TickerAsset | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [totalTicks, setTotalTicks] = useState(148);
  const [flashingSymbols, setFlashingSymbols] = useState<Record<string, "up" | "down">>({});
  const [isTickPulse, setIsTickPulse] = useState(false);
  const [lastTick, setLastTick] = useState<LiveTickTelemetry>({
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 138.45,
    delta: 1.25,
    changePercent: 0.91,
    direction: "up",
    timestamp: Date.now(),
    tickId: 148,
  });

  // Audio Context for optional subtle tick sound
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTickSound = useCallback((direction: "up" | "down") => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {
          // Gracefully suppress autoplay policy restriction in iframes
        });
      }
      if (ctx.state === "closed") return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(direction === "up" ? 880 : 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio suppressed or unsupported
    }
  }, [soundEnabled]);

  // Persist assets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("maxla_ticker_assets", JSON.stringify(assets));
    } catch {
      // LocalStorage full or private browsing
    }
  }, [assets]);

  // 1. Real Market Loader for 9 Real Strategic Companies & Commodity Futures
  useEffect(() => {
    async function loadRealMarket() {
      const tickers = ['TSM', 'ASML', 'NVDA', 'AMAT', 'LRCX', 'GFS', 'ASX', 'MP', 'INTC'];
      const key = 'demo'; // TwelveData demo key

      // A. Primary TwelveData fetch loop as requested
      for (const t of tickers) {
        try {
          const r = await fetch(`https://api.twelvedata.com/price?symbol=${t}&apikey=${key}`);
          const j = await r.json();
          const el = document.getElementById('ticker-' + t);
          if (j && j.price) {
            const numPrice = parseFloat(j.price);
            if (el) el.innerText = t + ' $' + j.price;
            document.querySelectorAll('.ticker-val-' + t).forEach((node) => {
              (node as HTMLElement).innerText = t + ' $' + j.price;
            });
            if (!isNaN(numPrice)) {
              setAssets((prev) =>
                prev.map((a) =>
                  a.symbol === t
                    ? {
                        ...a,
                        price: numPrice,
                        change: Number((numPrice - a.previousClose).toFixed(2)),
                        changePercent: Number((((numPrice - a.previousClose) / a.previousClose) * 100).toFixed(2)),
                        lastUpdate: Date.now(),
                      }
                    : a
                )
              );
            }
          }
        } catch {}
      }

      // B. Real Live Public Verified Stream from /api/market/quotes (Yahoo Finance Live + ICE/NYMEX Futures)
      try {
        const res = await fetch('/api/market/quotes');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.quotes) && data.quotes.length > 0) {
            setAssets((prev) => {
              return prev.map((asset) => {
                const match = data.quotes.find((q: any) => q.symbol === asset.symbol);
                if (match) {
                  const numPrice = Number(match.price);
                  const el = document.getElementById('ticker-' + asset.symbol);
                  if (el) el.innerText = asset.symbol + ' $' + numPrice.toFixed(2);
                  document.querySelectorAll('.ticker-val-' + asset.symbol).forEach((node) => {
                    (node as HTMLElement).innerText = asset.symbol + ' $' + numPrice.toFixed(2);
                  });

                  return {
                    ...asset,
                    price: numPrice,
                    change: match.change ?? asset.change,
                    changePercent: match.changePercent ?? asset.changePercent,
                    high24h: match.high24h ?? Math.max(asset.high24h, numPrice),
                    low24h: match.low24h ?? Math.min(asset.low24h, numPrice),
                    volume: match.volume ? String(match.volume) : asset.volume,
                    lastUpdate: Date.now(),
                  };
                }
                return asset;
              });
            });
          }
        }
      } catch (err) {
        console.warn("Live market quotes sync notice:", err);
      }
    }

    loadRealMarket();
    const interval = setInterval(loadRealMarket, 30000);
    return () => clearInterval(interval);
  }, []);

  // Central Market Tick Executor (used by both continuous timer and manual Instant Tick)
  const executeMarketTick = useCallback((desiredCount = 1) => {
    setAssets((prevAssets) => {
      if (!prevAssets.length) return prevAssets;

      const updated = [...prevAssets];
      const updateCount = Math.min(desiredCount, updated.length);
      const newFlashes: Record<string, "up" | "down"> = {};
      let latestTickedAsset: LiveTickTelemetry | null = null;

      for (let i = 0; i < updateCount; i++) {
        const targetIndex = Math.floor(Math.random() * updated.length);
        const asset = updated[targetIndex];

        // Realistic volatility scale based on asset category
        let volatility = 0.0015; // default 0.15%
        if (asset.category === "crypto") volatility = 0.0035;
        if (asset.category === "rates") volatility = 0.0004;
        if (asset.category === "fx") volatility = 0.0003;
        if (asset.category === "commodities") volatility = 0.002;

        const deltaFactor = (Math.random() - 0.49) * volatility;
        const priceChange = asset.price * deltaFactor;
        const newPrice = Math.max(0.001, Number((asset.price + priceChange).toFixed(asset.price < 10 ? 4 : 2)));
        const direction: "up" | "down" = priceChange >= 0 ? "up" : "down";

        const totalChange = Number((newPrice - asset.previousClose).toFixed(asset.price < 10 ? 4 : 2));
        const totalChangePercent = Number(((totalChange / asset.previousClose) * 100).toFixed(2));

        const newHigh = Math.max(asset.high24h, newPrice);
        const newLow = Math.min(asset.low24h, newPrice);

        const newHistory = [...asset.history.slice(-25), newPrice];
        const newSparkline = [...asset.sparkline.slice(-15), newPrice];

        updated[targetIndex] = {
          ...asset,
          price: newPrice,
          change: totalChange,
          changePercent: totalChangePercent,
          high24h: newHigh,
          low24h: newLow,
          history: newHistory,
          sparkline: newSparkline,
          lastUpdate: Date.now(),
          tickDirection: direction,
        };

        newFlashes[asset.symbol] = direction;
        playTickSound(direction);

        latestTickedAsset = {
          symbol: asset.symbol,
          name: asset.name,
          price: newPrice,
          delta: priceChange,
          changePercent: totalChangePercent,
          direction,
          timestamp: Date.now(),
          tickId: totalTicks + i + 1,
        };
      }

      if (latestTickedAsset) {
        setLastTick(latestTickedAsset);
      }

      setIsTickPulse(true);
      setTimeout(() => setIsTickPulse(false), 350);

      setFlashingSymbols((prev) => ({ ...prev, ...newFlashes }));
      setTotalTicks((t) => t + updateCount);

      // Clear flashes after 1200ms
      setTimeout(() => {
        setFlashingSymbols((prev) => {
          const next = { ...prev };
          Object.keys(newFlashes).forEach((k) => delete next[k]);
          return next;
        });
      }, 1200);

      return updated;
    });
  }, [totalTicks, playTickSound]);

  // Continuous realistic tick simulation engine
  useEffect(() => {
    if (isPaused) return;

    const intervalMs = Math.round(1800 / speedMultiplier);
    const tickInterval = setInterval(() => {
      const updateCount = Math.floor(Math.random() * 3) + 1;
      executeMarketTick(updateCount);
    }, intervalMs);

    return () => clearInterval(tickInterval);
  }, [isPaused, speedMultiplier, executeMarketTick]);

  // Filtered asset list
  const filteredAssets = useMemo(() => {
    if (activeCategory === "all") return assets;
    return assets.filter((a) => a.category === activeCategory);
  }, [assets, activeCategory]);

  // Calculate market breadth
  const positiveCount = assets.filter((a) => a.changePercent >= 0).length;
  const negativeCount = assets.length - positiveCount;
  const marketSentiment = positiveCount >= negativeCount ? "Bullish / Risk-On" : "Defensive / Risk-Off";

  const handleAddAsset = (newAsset: TickerAsset) => {
    setAssets((prev) => [newAsset, ...prev]);
  };

  const handleManualRefresh = () => {
    executeMarketTick(4);
  };

  return (
    <div id="live-price-ticker-root" className="w-full bg-slate-950 border-b border-slate-800/90 text-slate-100">
      {/* Ticker Control & Breadth Sub-Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-900 bg-slate-950/80">
        {/* Left: Live Status & Market Breadth */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full text-emerald-400 font-semibold tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] uppercase tracking-wider font-bold">Live Market Stream</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
            <span>Breadth:</span>
            <span className="text-emerald-400 font-mono font-medium">{positiveCount} ▲</span>
            <span className="text-slate-600">|</span>
            <span className="text-rose-400 font-mono font-medium">{negativeCount} ▼</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-medium">{marketSentiment}</span>
          </div>
        </div>

        {/* Center: Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {(
            [
              { id: "all", label: "All Real Tickers", count: assets.length },
              { id: "equities", label: "Semiconductors", count: assets.filter((a) => a.category === "equities").length },
              { id: "commodities", label: "Critical Minerals", count: assets.filter((a) => a.category === "commodities").length },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              id={`ticker-cat-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {cat.label}
              <span className="ml-1 opacity-70 font-mono text-[10px]">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Right: Controls (Pause/Play, Speed, Mode, Add) */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            id="toggle-ticker-pause-btn"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume Ticker Stream" : "Pause Ticker Stream"}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Speed Selector */}
          <button
            id="toggle-ticker-speed-btn"
            onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : prev === 4 ? 0.5 : 1))}
            title="Cycle Tick Frequency (0.5x, 1x, 2x, 4x)"
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-mono text-[11px] transition font-bold"
          >
            {speedMultiplier}x
          </button>

          {/* Audio toggle */}
          <button
            id="toggle-ticker-sound-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute Tick Sound" : "Enable Soft Tick Sound"}
            className={`p-1.5 rounded-lg border transition ${
              soundEnabled
                ? "bg-indigo-950/70 border-indigo-700 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* View Mode Toggle */}
          <button
            id="toggle-ticker-view-mode-btn"
            onClick={() => setViewMode(viewMode === "tape" ? "grid" : "tape")}
            title={viewMode === "tape" ? "Switch to Grid View" : "Switch to Tape View"}
            className={`p-1.5 rounded-lg border transition ${
              viewMode === "grid"
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>

          {/* Manual Refresh / Pulse */}
          <button
            id="ticker-manual-refresh-btn"
            onClick={handleManualRefresh}
            title="Force Price Tick Refresh"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Add Asset Modal Button */}
          <button
            id="open-add-asset-modal-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium text-[11px] transition shadow-sm"
          >
            <Plus className="w-3 h-3" />
            <span>Track Symbol</span>
          </button>
        </div>
      </div>

      {/* Live Data Tick Telemetry & Instant Action Deck */}
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2.5 text-xs bg-slate-900/60 border-b border-slate-850">
        {/* Left: Real-Time Tick Counter & Heartbeat */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-850 shadow-inner font-mono text-[11px]">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isPaused
                    ? "bg-amber-400"
                    : isTickPulse
                    ? lastTick.direction === "up"
                      ? "bg-emerald-400 animate-ping"
                      : "bg-rose-400 animate-ping"
                    : "bg-emerald-500/50"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 transition-colors duration-150 ${
                  isPaused
                    ? "bg-amber-500"
                    : lastTick.direction === "up"
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                }`}
              />
            </span>
            <span className="text-slate-400 font-semibold tracking-wide">LIVE TICK</span>
            <span className="text-white font-black tracking-tight">#{totalTicks.toLocaleString()}</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 text-[10px]">
              {isPaused ? "PAUSED" : `${(1.8 / speedMultiplier).toFixed(2)}s/tick`}
            </span>
          </div>

          {/* Real-time Last Ticked Instrument Pill */}
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-slate-500 hidden sm:inline">Stream:</span>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border transition-all duration-300 ${
                lastTick.direction === "up"
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                  : "bg-rose-950/80 text-rose-300 border-rose-700/60 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
              }`}
            >
              <span className="font-black text-xs">{lastTick.symbol}</span>
              <span className="font-bold">
                {lastTick.direction === "up" ? "▲" : "▼"} {lastTick.delta >= 0 ? "+" : ""}
                {lastTick.delta.toFixed(lastTick.price < 10 ? 4 : 2)}
              </span>
              <span className="text-[10px] opacity-75">
                ({lastTick.delta >= 0 ? "+" : ""}{lastTick.changePercent.toFixed(2)}%)
              </span>
            </div>
            <span className="text-[10px] text-slate-500 hidden md:inline">
              {new Date(lastTick.timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Right: Instant Tick Action Button & Speed Badge */}
        <div className="flex items-center gap-2">
          {/* Instant Manual Tick Trigger Button */}
          <button
            id="force-live-tick-btn"
            onClick={() => executeMarketTick(1)}
            title="Generate Instant Live Data Tick (Simulates Real-time Market Trade)"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-[11px] shadow-sm shadow-emerald-900/50 transition duration-150 active:scale-95 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-slate-950" />
            <span>Instant Tick</span>
          </button>

          {/* Quick 4-Asset Bulk Tick */}
          <button
            id="force-bulk-tick-btn"
            onClick={() => executeMarketTick(4)}
            title="Trigger Multiple Asset Ticks Simultaneously"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-mono transition cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Multi-Tick (4x)</span>
          </button>
        </div>
      </div>

      {/* Main Ticker Display: Tape Mode (Marquee) vs Grid Mode */}
      {viewMode === "tape" ? (
        <div className="relative w-full overflow-hidden py-2 bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950">
          {/* Subtle edge fades for infinite ticker tape illusion */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

          {/* Scrolling Ticker Track */}
          <div
            className={`animate-ticker-marquee ${isPaused ? "ticker-paused" : ""}`}
            style={{
              animationDuration: `${Math.max(25, 60 / speedMultiplier)}s`,
            }}
          >
            {/* Render items twice to ensure completely seamless 100% infinite scroll */}
            {[...filteredAssets, ...filteredAssets].map((asset, index) => {
              const isPositive = asset.changePercent >= 0;
              const flashDirection = flashingSymbols[asset.symbol];

              return (
                <div
                  key={`${asset.symbol}-${index}`}
                  id={`ticker-item-${asset.symbol}-${index}`}
                  onClick={() => setSelectedAsset(asset)}
                  className={`group relative flex items-center gap-3 px-4 py-2 mx-1.5 rounded-xl border border-slate-800/80 bg-slate-900/70 hover:bg-slate-850 hover:border-slate-700 cursor-pointer transition-all duration-200 select-none ${
                    flashDirection === "up"
                      ? "tick-flash-up"
                      : flashDirection === "down"
                      ? "tick-flash-down"
                      : ""
                  }`}
                >
                  {/* Live Tick Pill Alert */}
                  {flashDirection && (
                    <span
                      className={`absolute -top-2 right-2 px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider shadow-md z-30 flex items-center gap-0.5 animate-pulse ${
                        flashDirection === "up"
                          ? "bg-emerald-400 text-slate-950 shadow-emerald-500/50 ring-1 ring-emerald-300"
                          : "bg-rose-500 text-white shadow-rose-500/50 ring-1 ring-rose-300"
                      }`}
                    >
                      {flashDirection === "up" ? "▲ TICK" : "▼ TICK"}
                    </span>
                  )}

                  {/* Symbol & Category */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                        {asset.symbol}
                      </span>
                      <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {asset.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate max-w-[85px]">{asset.name}</span>
                  </div>

                  {/* Price */}
                  <div className="flex flex-col items-end">
                    <span
                      id={index < filteredAssets.length ? 'ticker-' + asset.symbol : `ticker-${asset.symbol}-dup`}
                      className={`ticker-val-${asset.symbol} font-mono text-xs font-semibold text-white tracking-tight`}
                    >
                      {asset.symbol} ${asset.price.toFixed(2)}
                    </span>

                    {/* Change % Badge */}
                    <div
                      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        isPositive ? "text-emerald-400 bg-emerald-950/40" : "text-rose-400 bg-rose-950/40"
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      <span>
                        {isPositive ? "+" : ""}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Mini Sparkline */}
                  <div className="hidden md:block pl-1">
                    <TickerSparkline data={asset.sparkline} isPositive={isPositive} width={48} height={20} />
                  </div>

                  {/* Quick Expand Icon on Hover */}
                  <Maximize2 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Grid View Mode */
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredAssets.map((asset) => {
              const isPositive = asset.changePercent >= 0;
              const flashDirection = flashingSymbols[asset.symbol];

              return (
                <div
                  key={asset.symbol}
                  id={`ticker-grid-card-${asset.symbol}`}
                  onClick={() => setSelectedAsset(asset)}
                  className={`group relative p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 cursor-pointer transition-all duration-200 ${
                    flashDirection === "up"
                      ? "tick-flash-up"
                      : flashDirection === "down"
                      ? "tick-flash-down"
                      : ""
                  }`}
                >
                  {/* Live Tick Pill Alert */}
                  {flashDirection && (
                    <span
                      className={`absolute -top-2 right-3 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-md z-20 flex items-center gap-0.5 animate-pulse ${
                        flashDirection === "up"
                          ? "bg-emerald-400 text-slate-950 shadow-emerald-500/50 ring-1 ring-emerald-300"
                          : "bg-rose-500 text-white shadow-rose-500/50 ring-1 ring-rose-300"
                      }`}
                    >
                      {flashDirection === "up" ? "▲ TICK" : "▼ TICK"}
                    </span>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white group-hover:text-indigo-400 transition">
                          {asset.symbol}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {asset.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-[160px]">{asset.name}</p>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                        isPositive ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40" : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>
                        {isPositive ? "+" : ""}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-3">
                    <div>
                      <div className="text-base font-bold font-mono text-white">
                        {asset.currency}
                        {asset.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: asset.price < 10 ? 4 : 2,
                        })}
                        {asset.unit && <span className="text-xs text-slate-400 ml-1">{asset.unit}</span>}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Vol: {asset.volume} | Day: {asset.currency}{asset.low24h.toLocaleString()} - {asset.currency}{asset.high24h.toLocaleString()}
                      </div>
                    </div>

                    <TickerSparkline data={asset.sparkline} isPositive={isPositive} width={64} height={26} showGradient />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Asset Deep Dive Modal */}
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
          onAddAsset={handleAddAsset}
        />
      )}
    </div>
  );
};
