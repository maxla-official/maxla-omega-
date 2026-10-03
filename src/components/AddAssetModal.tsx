import React, { useState } from "react";
import { X, Search, Plus, Check, TrendingUp } from "lucide-react";
import { TickerAsset } from "../types";
import { PRESET_SEARCH_ASSETS } from "../data/marketData";

interface AddAssetModalProps {
  currentAssets: TickerAsset[];
  onClose: () => void;
  onAddAsset: (newAsset: TickerAsset) => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  currentAssets,
  onClose,
  onAddAsset,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"preset" | "custom">("preset");

  // Custom asset form state
  const [customSymbol, setCustomSymbol] = useState("");
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<TickerAsset["category"]>("equities");
  const [customPrice, setCustomPrice] = useState("100.00");
  const [customCurrency, setCustomCurrency] = useState("$");

  const existingSymbols = new Set(currentAssets.map((a) => a.symbol.toUpperCase()));

  const filteredPresets = PRESET_SEARCH_ASSETS.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.symbol.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleAddPreset = (preset: typeof PRESET_SEARCH_ASSETS[0]) => {
    const variance = (Math.random() - 0.5) * 0.04;
    const price = preset.basePrice;
    const change = price * variance;
    const changePercent = variance * 100;

    const newAsset: TickerAsset = {
      symbol: preset.symbol,
      name: preset.name,
      category: preset.category,
      price: price,
      change: change,
      changePercent: changePercent,
      previousClose: price - change,
      high24h: price * 1.025,
      low24h: price * 0.975,
      volume: "3.2M",
      currency: preset.currency,
      unit: preset.unit,
      history: [price * 0.98, price * 0.99, price * 1.01, price],
      sparkline: [price * 0.98, price * 0.99, price * 1.01, price],
      lastUpdate: Date.now(),
      marketCap: "Active Instrument",
      peRatio: "22.5x",
      dividendYield: "1.4%",
      executiveInsight: `Tracking price fluctuations for ${preset.name} with real-time volatility impact telemetry.`,
    };

    onAddAsset(newAsset);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSymbol.trim() || !customName.trim()) return;

    const price = parseFloat(customPrice) || 100.0;
    const newAsset: TickerAsset = {
      symbol: customSymbol.trim().toUpperCase(),
      name: customName.trim(),
      category: customCategory,
      price: price,
      change: 0.0,
      changePercent: 0.0,
      previousClose: price,
      high24h: price * 1.01,
      low24h: price * 0.99,
      volume: "1.0M",
      currency: customCurrency,
      history: [price, price, price, price],
      sparkline: [price, price, price, price],
      lastUpdate: Date.now(),
      marketCap: "Enterprise Benchmark",
      executiveInsight: `Custom monitored instrument for executive portfolio tracking and strategic risk evaluation.`,
    };

    onAddAsset(newAsset);
    onClose();
  };

  return (
    <div
      id="add-asset-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="add-asset-modal-card"
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Add to Live Price Ticker</h3>
            <p className="text-xs text-slate-400">Stream market assets directly into the executive ticker</p>
          </div>
          <button
            id="close-add-asset-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-3 gap-4">
          <button
            id="tab-preset-assets"
            onClick={() => setActiveTab("preset")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === "preset"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Institutional Presets
          </button>
          <button
            id="tab-custom-asset"
            onClick={() => setActiveTab("custom")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === "custom"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Custom Symbol / Commodity
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "preset" ? (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="search-asset-input"
                  type="text"
                  placeholder="Search by symbol, company, or commodity (e.g., AMZN, WTI, SOL)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Asset List */}
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {filteredPresets.map((preset) => {
                  const isTracked = existingSymbols.has(preset.symbol.toUpperCase());
                  return (
                    <div
                      key={preset.symbol}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-400">
                          {preset.symbol.substring(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{preset.symbol}</span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {preset.category}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">{preset.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate-300">
                          {preset.currency}
                          {preset.basePrice.toLocaleString()}
                          {preset.unit && <span className="text-[10px] text-slate-500 ml-0.5">{preset.unit}</span>}
                        </span>

                        {isTracked ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/40">
                            <Check className="w-3.5 h-3.5" />
                            Added
                          </span>
                        ) : (
                          <button
                            id={`add-preset-btn-${preset.symbol}`}
                            onClick={() => handleAddPreset(preset)}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredPresets.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No matching instruments found. Switch to the &quot;Custom Symbol&quot; tab to add any custom ticker!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Symbol Code (e.g. NVDA, OIL, EUR)
                  </label>
                  <input
                    id="custom-symbol-input"
                    type="text"
                    required
                    placeholder="TSLA"
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Instrument / Company Name
                  </label>
                  <input
                    id="custom-name-input"
                    type="text"
                    required
                    placeholder="Tesla Motors Inc"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    id="custom-category-select"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as TickerAsset["category"])}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="equities">Equities</option>
                    <option value="indices">Indices</option>
                    <option value="commodities">Commodities</option>
                    <option value="rates">Rates & Bonds</option>
                    <option value="crypto">Crypto</option>
                    <option value="fx">FX Currency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Currency Prefix</label>
                  <input
                    id="custom-currency-input"
                    type="text"
                    value={customCurrency}
                    onChange={(e) => setCustomCurrency(e.target.value)}
                    placeholder="$"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Base Price</label>
                  <input
                    id="custom-price-input"
                    type="number"
                    step="any"
                    required
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="250.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="submit-custom-asset-btn"
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Instrument to Ticker
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
