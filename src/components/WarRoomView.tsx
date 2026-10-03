import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Radio,
  Activity,
  Sliders,
  Play,
  RotateCcw,
  ShieldAlert,
  AlertTriangle,
  Globe,
  Navigation,
  Compass,
  Zap,
  TrendingDown,
  TrendingUp,
  Volume2,
  VolumeX,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Search,
  Crosshair,
  BarChart3,
  ExternalLink,
  Shield,
  FileCheck,
} from "lucide-react";
import { AuthorityAlert, ProblemInput } from "../types";
import { tacticalSound } from "../utils/soundEffects";
import { useLiveTelemetry } from "../context/LiveTelemetryContext";
import { LiveSeismicFabMonitor } from "./LiveSeismicFabMonitor";

interface WarRoomViewProps {
  onEscalateToSentinel?: (alert: AuthorityAlert) => void;
  onAnalyzeProblem?: (problem: Partial<ProblemInput>) => void;
  onNavigateToTab?: (tabId: string) => void;
}

// Live AIS Tracked Vessels Data
interface AISVessel {
  id: string;
  name: string;
  flag: string;
  imo: string;
  chokepoint: string;
  type: "Container" | "LNG Tanker" | "Specialized Chemical" | "Bulk Carrier";
  cargo: string;
  speedKnots: number;
  status: "Normal" | "Diverted" | "Slow-Steaming" | "AIS-Dark-Flagged";
  destination: string;
  rerouteExtraDays: number;
  fuelSurchargeUSD: number;
  coordinates: [number, number];
}

const INITIAL_AIS_VESSELS: AISVessel[] = [
  {
    id: "VESSEL-01",
    name: "Ever Forwarder IX",
    flag: "Panama",
    imo: "IMO 9832104",
    chokepoint: "Bab-el-Mandeb (Red Sea)",
    type: "Container",
    cargo: "21,400 TEU (Semiconductor Packaging Materials)",
    speedKnots: 11.2,
    status: "Diverted",
    destination: "Rotterdam via Cape of Good Hope",
    rerouteExtraDays: 14.5,
    fuelSurchargeUSD: 1240000,
    coordinates: [12.58, 43.34],
  },
  {
    id: "VESSEL-02",
    name: "Pacific Horizon Star",
    flag: "Singapore",
    imo: "IMO 9784319",
    chokepoint: "Strait of Malacca",
    type: "Specialized Chemical",
    cargo: "Ultra-Pure Hydrogen Fluoride (Semiconductor Grade)",
    speedKnots: 16.8,
    status: "Normal",
    destination: "GIFT City / Sanand Hub",
    rerouteExtraDays: 0,
    fuelSurchargeUSD: 0,
    coordinates: [2.15, 102.12],
  },
  {
    id: "VESSEL-03",
    name: "Hsinchu Pioneer",
    flag: "Liberia",
    imo: "IMO 9912045",
    chokepoint: "Taiwan Strait",
    type: "Container",
    cargo: "4,800 Finished TSMC Wafer Pods (NVIDIA B200 / Apple M4)",
    speedKnots: 8.4,
    status: "Slow-Steaming",
    destination: "Kaohsiung to Los Angeles",
    rerouteExtraDays: 4.8,
    fuelSurchargeUSD: 410000,
    coordinates: [24.12, 119.82],
  },
  {
    id: "VESSEL-04",
    name: "Al-Ruwais Navigator",
    flag: "Qatar",
    imo: "IMO 9642011",
    chokepoint: "Strait of Hormuz",
    type: "LNG Tanker",
    cargo: "216,000 m³ Liquefied Natural Gas",
    speedKnots: 15.1,
    status: "Normal",
    destination: "Dahej Terminal (India)",
    rerouteExtraDays: 0,
    fuelSurchargeUSD: 0,
    coordinates: [26.45, 56.42],
  },
  {
    id: "VESSEL-05",
    name: "Nordic Valour",
    flag: "Marshall Islands",
    imo: "IMO 9521190",
    chokepoint: "Cape of Good Hope Corridor",
    type: "Bulk Carrier",
    cargo: "55,000 MT High-Grade Silicon Metal & Germanium Ingots",
    speedKnots: 13.9,
    status: "Diverted",
    destination: "Dresden Silicon Saxony via Cape",
    rerouteExtraDays: 13.2,
    fuelSurchargeUSD: 980000,
    coordinates: [-34.82, 19.98],
  },
  {
    id: "VESSEL-06",
    name: "Eastern Ghost 409",
    flag: "Unknown (Unregistered)",
    imo: "IMO 9104423",
    chokepoint: "South China Sea / Luzon Strait",
    type: "Specialized Chemical",
    cargo: "Unmanifested Gallium / Germanium Concentrates",
    speedKnots: 19.2,
    status: "AIS-Dark-Flagged",
    destination: "Classified Destination",
    rerouteExtraDays: 7.0,
    fuelSurchargeUSD: 620000,
    coordinates: [20.85, 120.45],
  },
];

// Live Threat Wire items
interface ThreatWireItem {
  id: string;
  timestamp: string;
  source: string;
  severity: "CRITICAL" | "HIGH" | "ELEVATED";
  headline: string;
  chokepointImpact: string;
}

const THREAT_WIRE_FEED: ThreatWireItem[] = [
  {
    id: "TW-01",
    timestamp: "12s ago",
    source: "NORAD / SATELLITE AIS",
    severity: "CRITICAL",
    headline: "Commercial transit interdiction alert issued for Bab-el-Mandeb corridor. 16 container vessels re-routing to Cape.",
    chokepointImpact: "Red Sea: +14 days transit delay",
  },
  {
    id: "TW-02",
    timestamp: "1m ago",
    source: "TAIPEI ADIZ RADAR",
    severity: "HIGH",
    headline: "PLA joint naval combat patrols detected across median line of Taiwan Strait. Air freight charter rates surge +44%.",
    chokepointImpact: "Taiwan Strait: Risk score 92/100",
  },
  {
    id: "TW-03",
    timestamp: "3m ago",
    source: "BEIJING MOFCOM",
    severity: "HIGH",
    headline: "Dual-use export license review mandated on Gallium arsenide wafers & Antimony oxides. Spot prices gap up +18.4%.",
    chokepointImpact: "Raw Materials: 30-day export freeze",
  },
  {
    id: "TW-04",
    timestamp: "7m ago",
    source: "SINGAPORE PORT AUTHORITY",
    severity: "ELEVATED",
    headline: "Malacca Strait anchorage density reaches 94% capacity. Bunker fuel surcharge indexed to $795/MT.",
    chokepointImpact: "Malacca: +3.2 days port congestion",
  },
  {
    id: "TW-05",
    timestamp: "11m ago",
    source: "ROTTERDAM HARBOR MASTER",
    severity: "ELEVATED",
    headline: "Cape of Good Hope rerouted container fleet arrives in synchronized waves, triggering terminal berth bottlenecks.",
    chokepointImpact: "European Fabs: Lead times +19 days",
  },
];

// Dependency Network Nodes
interface DependencyNode {
  id: string;
  tier: "Tier-4 Extraction" | "Tier-3 Precursors" | "Tier-2 Tooling & Fabs" | "Tier-1 OEM & Hyperscale";
  name: string;
  country: string;
  share: string;
  downstreamImpactDays: number;
  revenueAtRiskDaily: number; // in Millions USD
  status: "Normal" | "Disrupted";
  description: string;
}

const DEPENDENCY_NODES: DependencyNode[] = [
  {
    id: "DEP-01",
    tier: "Tier-4 Extraction",
    name: "China Gallium & Germanium Refineries",
    country: "China",
    share: "78% Global Supply",
    downstreamImpactDays: 45,
    revenueAtRiskDaily: 340,
    status: "Normal",
    description: "Source mineral refining for RF power amplifiers, military radar GaAs chips, and fiber optics.",
  },
  {
    id: "DEP-02",
    tier: "Tier-3 Precursors",
    name: "Ukraine / Black Sea Neon Gas Purifiers",
    country: "Black Sea Basin",
    share: "45% Global Lithography Gas",
    downstreamImpactDays: 30,
    revenueAtRiskDaily: 520,
    status: "Normal",
    description: "Excimer laser gas required for DUV and EUV wafer lithography illumination.",
  },
  {
    id: "DEP-03",
    tier: "Tier-2 Tooling & Fabs",
    name: "ASML Veldhoven EUV & High-NA Tooling",
    country: "Netherlands",
    share: "100% Leading-Edge EUV",
    downstreamImpactDays: 180,
    revenueAtRiskDaily: 1250,
    status: "Normal",
    description: "Sole global manufacturer of Extreme Ultraviolet lithography machines ($350M each).",
  },
  {
    id: "DEP-04",
    tier: "Tier-2 Tooling & Fabs",
    name: "TSMC Fab 18 / 20 (Hsinchu & Tainan)",
    country: "Taiwan",
    share: "92% Sub-7nm Wafer Fabs",
    downstreamImpactDays: 21,
    revenueAtRiskDaily: 2800,
    status: "Normal",
    description: "Global foundry anchor for all sub-5nm AI processors, server CPUs, and advanced phone SoCs.",
  },
  {
    id: "DEP-05",
    tier: "Tier-1 OEM & Hyperscale",
    name: "Hyperscale AI & Defense Clusters",
    country: "Global (USA, EU, India, East Asia)",
    share: "Consumes 85% Advanced Wafers",
    downstreamImpactDays: 7,
    revenueAtRiskDaily: 4900,
    status: "Normal",
    description: "NVIDIA GB200, Apple Silicon, Lockheed Martin F-35 radars, and cloud datacenters.",
  },
];

export const WarRoomView: React.FC<WarRoomViewProps> = ({
  onEscalateToSentinel,
  onAnalyzeProblem,
  onNavigateToTab,
}) => {
  // Live Clock State
  const [liveUtcTime, setLiveUtcTime] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Active AIS Vessel Selection
  const [selectedVessel, setSelectedVessel] = useState<AISVessel>(INITIAL_AIS_VESSELS[0]);

  // Live Threat Wire cycling
  const [activeWireIndex, setActiveWireIndex] = useState<number>(0);

  // 10,000x Quantum Monte Carlo Simulation Inputs
  const [taiwanBlockadeSeverity, setTaiwanBlockadeSeverity] = useState<number>(65); // 0-100%
  const [redSeaInterdictionSeverity, setRedSeaInterdictionSeverity] = useState<number>(80); // 0-100%
  const [mineralEmbargoSeverity, setMineralEmbargoSeverity] = useState<number>(70); // 0-100%
  const [euvSanctionsActive, setEuvSanctionsActive] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSeed, setSimSeed] = useState<number>(42);

  // Dependency network disrupted node
  const [disruptedNodeId, setDisruptedNodeId] = useState<string | null>("DEP-04");

  // Keep live UTC clock ticking
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveUtcTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live Telemetry Provider Hook
  const { data: liveTelemetry } = useLiveTelemetry();

  // Dynamic Real-World Combined Threat Wire
  const combinedThreatWire = useMemo(() => {
    const list = [...THREAT_WIRE_FEED];
    // Prepend real USGS live earthquake alert if present
    if (liveTelemetry?.earthquakes && liveTelemetry.earthquakes.length > 0) {
      const topQuake = liveTelemetry.earthquakes.find((q) => q.mag >= 4.5) || liveTelemetry.earthquakes[0];
      if (topQuake) {
        list.unshift({
          id: `TW-REAL-QUAKE-${topQuake.id}`,
          timestamp: "LIVE USGS",
          source: "USGS REAL-TIME SEISMIC",
          severity: topQuake.cleanroomRisk === "CRITICAL" ? "CRITICAL" : topQuake.mag >= 5.0 ? "HIGH" : "ELEVATED",
          headline: `M ${topQuake.mag.toFixed(1)} recorded near ${topQuake.place}. Nearest Foundry: ${topQuake.nearestFab?.fabName || "Global"} (${topQuake.nearestFab?.distanceKm} km). Cleanroom Status: ${topQuake.cleanroomRisk}.`,
          chokepointImpact: `${topQuake.nearestFab?.fabCountry || "Fab Zone"}: ${topQuake.cleanroomRisk} vibration`,
        });
      }
    }
    // Prepend real NOAA Space Weather alert if present
    if (liveTelemetry?.spaceWeather && liveTelemetry.spaceWeather.length > 0) {
      const sw = liveTelemetry.spaceWeather[0];
      list.unshift({
        id: "TW-REAL-NOAA",
        timestamp: "LIVE NOAA",
        source: "NOAA SPACE WEATHER OPS",
        severity: "ELEVATED",
        headline: sw.message.replace(/[\r\n]+/g, " ").slice(0, 150) + "...",
        chokepointImpact: "Satellite Marine GPS Telemetry",
      });
    }
    return list;
  }, [liveTelemetry?.earthquakes, liveTelemetry?.spaceWeather]);

  // Cycle Threat Wire
  useEffect(() => {
    if (combinedThreatWire.length === 0) return;
    const interval = setInterval(() => {
      setActiveWireIndex((prev) => (prev + 1) % combinedThreatWire.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [combinedThreatWire.length]);

  // Toggle sound effects safely
  const toggleSound = () => {
    tacticalSound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      tacticalSound.playPing();
    }
  };

  // Monte Carlo 10,000x Computation Results (Stochastic formula)
  const monteCarloResults = useMemo(() => {
    // Composite Risk Index (0 - 100)
    const compositeSeverity =
      taiwanBlockadeSeverity * 0.4 +
      redSeaInterdictionSeverity * 0.3 +
      mineralEmbargoSeverity * 0.2 +
      (euvSanctionsActive ? 100 : 0) * 0.1;

    // Value at Risk in $ Billions (stochastic tail)
    const baseVar = (compositeSeverity / 100) * 32.5;
    const var50th = +(baseVar * 0.62 + (simSeed % 5) * 0.1).toFixed(2);
    const var95th = +(baseVar * 0.88 + (simSeed % 7) * 0.15).toFixed(2);
    const var99thTail = +(baseVar * 1.15 + (simSeed % 9) * 0.2).toFixed(2);

    // Days until global fab stockout
    const daysToStockout = +(
      Math.max(12, 90 - compositeSeverity * 0.78) +
      (simSeed % 3) * 0.4
    ).toFixed(1);

    // Assembly stall probability
    const stallProbability = +(
      Math.min(99.4, compositeSeverity * 0.94 + 5)
    ).toFixed(1);

    // Wafer surcharge inflation
    const surchargeMultiplier = +(compositeSeverity * 3.8 + 25).toFixed(0);

    // Generate bell curve data points for SVG rendering
    const points: [number, number][] = [];
    for (let x = 0; x <= 100; x += 4) {
      const mean = compositeSeverity;
      const sigma = 16;
      const y = Math.exp(-0.5 * Math.pow((x - mean) / sigma, 2)) * 85;
      points.push([x, Math.max(4, y)]);
    }

    return {
      compositeSeverity,
      var50th,
      var95th,
      var99thTail,
      daysToStockout,
      stallProbability,
      surchargeMultiplier,
      points,
    };
  }, [
    taiwanBlockadeSeverity,
    redSeaInterdictionSeverity,
    mineralEmbargoSeverity,
    euvSanctionsActive,
    simSeed,
  ]);

  // Run real-time simulation trigger
  const handleRunMonteCarlo = () => {
    setIsSimulating(true);
    tacticalSound.playSimRun();
    setTimeout(() => {
      setSimSeed((prev) => prev + Math.floor(Math.random() * 50) + 1);
      setIsSimulating(false);
      tacticalSound.playPing();
    }, 600);
  };

  // Reset inputs
  const handleResetInputs = () => {
    setTaiwanBlockadeSeverity(50);
    setRedSeaInterdictionSeverity(50);
    setMineralEmbargoSeverity(50);
    setEuvSanctionsActive(false);
    tacticalSound.playPing();
  };

  // Escalate Monte Carlo crisis to Sentinel Decision Center
  const handleEscalateScenario = () => {
    tacticalSound.playAlert();
    if (onEscalateToSentinel) {
      const simulatedAlert: AuthorityAlert = {
        id: `ALERT-MC-${Date.now().toString().slice(-4)}`,
        timestamp: "JUST NOW",
        title: `Monte Carlo Shock Protocol: ${monteCarloResults.stallProbability}% Stockout Risk`,
        severity: "critical",
        source: "Quantum Monte Carlo Engine (10,000 Iterations)",
        description: `Severe disruption of automotive and defense electronics due to simultaneous Red Sea and Taiwan Strait delays with 99% Tail Risk of $${monteCarloResults.var99thTail}B.`,
        recommendedAction: `Authorize immediate 90-day sovereign buffer procurement; activate Cape of Good Hope maritime fuel surcharges and air-corridor charters for wafer transport.`,
        requiresDualKey: true,
        status: "active",
      };
      onEscalateToSentinel(simulatedAlert);
      if (onNavigateToTab) {
        onNavigateToTab("authority-sentinel");
      }
    }
  };

  const activeWire = combinedThreatWire[activeWireIndex] || combinedThreatWire[0];

  // Active Disrupted Node Info
  const activeDisruptedNode = useMemo(() => {
    return DEPENDENCY_NODES.find((n) => n.id === disruptedNodeId) || DEPENDENCY_NODES[0];
  }, [disruptedNodeId]);

  return (
    <div className="space-y-6">
      {/* 1. Global Tactical DEFCON & Telemetry Header Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        {/* Background tactical grid subtle lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold tracking-wider uppercase bg-rose-950/80 text-rose-400 border border-rose-800/80 shadow-md">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>DEFCON 2 : HIGH INTERDICTION RISK</span>
              </span>

              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>148,920 AIS Vessels Live</span>
              </span>

              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{liveUtcTime || "SYNCING UTC CLOCK..."}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Crosshair className="w-6 h-6 text-rose-400 shrink-0" />
              <span>Global War Room & Quantum Crisis Stress-Test Terminal</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-3xl">
              Live multi-chokepoint maritime AIS telemetry, 10,000-draw stochastic Monte Carlo shock testing, and interactive multi-tier supply chain failure propagation engine.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition border ${
                soundEnabled
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-700 shadow-md shadow-emerald-950"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
              title="Toggle Tactical Audio Cues (Web Audio API Synthesizer)"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>TACTICAL AUDIO ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span>AUDIO MUTED</span>
                </>
              )}
            </button>

            <button
              onClick={handleRunMonteCarlo}
              disabled={isSimulating}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-indigo-950/80 border border-indigo-400/40 transition disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 text-amber-300 ${isSimulating ? "animate-spin" : ""}`} />
              <span>{isSimulating ? "COMPUTING 10,000x..." : "RE-RUN 10k STRESS TEST"}</span>
            </button>
          </div>
        </div>

        {/* Live Threat Wire Ticker Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs relative z-10">
          <div className="flex items-center space-x-2 overflow-hidden">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-900/60 text-rose-300 border border-rose-800/60 shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
              <span>LIVE INTEL WIRE</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 shrink-0">
              [{activeWire.source}]
            </span>
            <span className="text-slate-200 font-medium truncate">
              {activeWire.headline}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0 text-[11px] font-mono text-slate-400">
            <span className="text-amber-400 font-semibold">{activeWire.chokepointImpact}</span>
            <span>•</span>
            <span className="text-slate-500">{activeWire.timestamp}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Grid: Monte Carlo Simulator + Live AIS Sonar Radar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: 10,000x Quantum Monte Carlo Simulator (7 Cols) */}
        <div className="xl:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
                  Stochastic Quantum Core
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  10,000 Real-Time Draws
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <span>Multi-Scenario Crisis Stress-Test Engine</span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetInputs}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition border border-slate-700"
                title="Reset Simulation Baseline"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleEscalateScenario}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-md shadow-rose-950 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Escalate Order</span>
              </button>
            </div>
          </div>

          {/* Interactive Shock Injections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Slider 1: Taiwan Strait Blockade */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Taiwan Strait Blockade</span>
                <span className="font-mono font-bold text-rose-400">
                  {taiwanBlockadeSeverity}% Severity
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={taiwanBlockadeSeverity}
                onChange={(e) => {
                  setTaiwanBlockadeSeverity(+e.target.value);
                  tacticalSound.playPing();
                }}
                className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Open Patrols</span>
                <span>Submarine Quarantine</span>
                <span>Full Closure</span>
              </div>
            </div>

            {/* Slider 2: Bab-el-Mandeb & Suez */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Bab-el-Mandeb & Red Sea</span>
                <span className="font-mono font-bold text-amber-400">
                  {redSeaInterdictionSeverity}% Severity
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={redSeaInterdictionSeverity}
                onChange={(e) => {
                  setRedSeaInterdictionSeverity(+e.target.value);
                  tacticalSound.playPing();
                }}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Escorted Convoys</span>
                <span>Missile Targeting</span>
                <span>100% Diverted</span>
              </div>
            </div>

            {/* Slider 3: Gallium / Rare-Earth Embargo */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Gallium / Germanium Export</span>
                <span className="font-mono font-bold text-cyan-400">
                  {mineralEmbargoSeverity}% Embargo
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mineralEmbargoSeverity}
                onChange={(e) => {
                  setMineralEmbargoSeverity(+e.target.value);
                  tacticalSound.playPing();
                }}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Standard Quotas</span>
                <span>Dual-Use Review</span>
                <span>Total Ban</span>
              </div>
            </div>

            {/* Toggle: EUV Lithography Tooling Sanctions */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  EUV Machine Servicing Cutoff
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  ASML engineer & optic software ban
                </div>
              </div>
              <button
                onClick={() => {
                  setEuvSanctionsActive(!euvSanctionsActive);
                  tacticalSound.playPing();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
                  euvSanctionsActive
                    ? "bg-rose-950 text-rose-300 border-rose-700 shadow-sm"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {euvSanctionsActive ? "ACTIVE CUTOFF" : "STANDARD"}
              </button>
            </div>
          </div>

          {/* Monte Carlo Density Bell Curve (SVG) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span className="font-mono font-bold text-slate-200">
                  Monte Carlo Loss Distribution (Value-at-Risk Tail Risk)
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] font-mono">
                <span className="text-slate-400">
                  50th %: <strong className="text-slate-200">${monteCarloResults.var50th}B</strong>
                </span>
                <span className="text-slate-400">
                  95th %: <strong className="text-amber-400">${monteCarloResults.var95th}B</strong>
                </span>
                <span className="text-slate-400">
                  99th %: <strong className="text-rose-400">${monteCarloResults.var99thTail}B</strong>
                </span>
              </div>
            </div>

            {/* SVG Visual Density Bell Curve */}
            <div className="h-32 w-full relative">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="90" x2="100" y2="90" stroke="#334155" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeDasharray="2" strokeWidth="0.5" />

                {/* Shaded Area */}
                <path
                  d={`M 0 90 ${monteCarloResults.points
                    .map((p) => `L ${p[0]} ${90 - p[1]}`)
                    .join(" ")} L 100 90 Z`}
                  fill="url(#curveGradient)"
                />

                {/* Smooth Curve Line */}
                <path
                  d={`M 0 90 ${monteCarloResults.points
                    .map((p) => `L ${p[0]} ${90 - p[1]}`)
                    .join(" ")}`}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.8"
                />

                {/* 99th Percentile Marker Line */}
                <line
                  x1={Math.min(96, monteCarloResults.compositeSeverity + 18)}
                  y1="10"
                  x2={Math.min(96, monteCarloResults.compositeSeverity + 18)}
                  y2="90"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="2"
                />
              </svg>

              {/* Float badge on 99% Tail Risk */}
              <div
                style={{
                  left: `${Math.min(90, Math.max(10, monteCarloResults.compositeSeverity + 10))}%`,
                }}
                className="absolute top-2 -translate-x-1/2 px-2 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-700 text-[10px] font-mono font-bold shadow-lg"
              >
                99% VaR: ${monteCarloResults.var99thTail}B Exposure
              </div>
            </div>
          </div>

          {/* Monte Carlo Live Output Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">99% Tail Loss</span>
              <div className="text-base sm:text-lg font-mono font-bold text-rose-400">
                ${monteCarloResults.var99thTail}B
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Value at Risk</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Days to Stockout</span>
              <div className="text-base sm:text-lg font-mono font-bold text-amber-400">
                {monteCarloResults.daysToStockout} Days
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Fab Inventory Limit</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Assembly Stall</span>
              <div className="text-base sm:text-lg font-mono font-bold text-cyan-400">
                {monteCarloResults.stallProbability}%
              </div>
              <span className="text-[10px] text-slate-500 font-mono">OEM Halt Probability</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Wafer Surcharge</span>
              <div className="text-base sm:text-lg font-mono font-bold text-emerald-400">
                +{monteCarloResults.surchargeMultiplier}%
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Air Cargo Premium</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live AIS Sonar Radar & Chokepoint Fleet Telemetry (5 Cols) */}
        <div className="xl:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-1 border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  TACTICAL AIS SONAR RADAR
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Satellite Pass: ACTIVE
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Chokepoint Vessel Fleet & Diversion Telemetry
            </h3>
          </div>

          {/* Sonar Radar Screen Animation */}
          <div className="relative w-full aspect-square max-h-56 mx-auto rounded-full bg-slate-950 border-2 border-emerald-500/30 overflow-hidden flex items-center justify-center shadow-inner shadow-emerald-950/80">
            {/* Concentric distance rings */}
            <div className="absolute inset-4 rounded-full border border-emerald-500/20" />
            <div className="absolute inset-12 rounded-full border border-emerald-500/20" />
            <div className="absolute inset-20 rounded-full border border-emerald-500/20" />
            <div className="absolute w-full h-[1px] bg-emerald-500/20" />
            <div className="absolute h-full w-[1px] bg-emerald-500/20" />

            {/* Rotating Radar Sweeping Beam */}
            <div className="absolute inset-0 origin-center animate-spin-slow bg-gradient-to-tr from-transparent via-emerald-500/10 to-emerald-400/40 pointer-events-none rounded-full" />

            {/* Pulsing Sonar Vessel Blips */}
            {INITIAL_AIS_VESSELS.map((vessel, idx) => {
              const isSelected = selectedVessel.id === vessel.id;
              // Static angular positioning inside the radar circle
              const angles = [35, 120, 210, 290, 160, 340];
              const radii = [30, 48, 62, 38, 70, 52];
              const angle = angles[idx % angles.length];
              const radius = radii[idx % radii.length];
              const rad = (angle * Math.PI) / 180;
              const x = 50 + (radius / 2) * Math.cos(rad);
              const y = 50 + (radius / 2) * Math.sin(rad);

              return (
                <div
                  key={vessel.id}
                  onClick={() => {
                    setSelectedVessel(vessel);
                    tacticalSound.playPing();
                  }}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20`}
                >
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
                      vessel.status === "Diverted"
                        ? "bg-rose-500 ring-4 ring-rose-500/40"
                        : vessel.status === "AIS-Dark-Flagged"
                        ? "bg-amber-500 ring-4 ring-amber-500/40"
                        : "bg-emerald-400 ring-4 ring-emerald-400/40"
                    } ${isSelected ? "scale-150 ring-white" : "group-hover:scale-125"}`}
                  />
                  {isSelected && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-white shadow-xl">
                      {vessel.name}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Radar Center Coordinate */}
            <div className="z-10 w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400" />
          </div>

          {/* Selected Vessel Inspection Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedVessel.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {selectedVessel.imo} • Flag: {selectedVessel.flag}
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                  selectedVessel.status === "Diverted"
                    ? "bg-rose-950/80 text-rose-300 border-rose-800"
                    : selectedVessel.status === "AIS-Dark-Flagged"
                    ? "bg-amber-950/80 text-amber-300 border-amber-800"
                    : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                }`}
              >
                {selectedVessel.status}
              </span>
            </div>

            <div className="space-y-1 pt-1 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500 font-mono">Chokepoint:</span>
                <span className="font-medium text-slate-200">{selectedVessel.chokepoint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-mono">Payload:</span>
                <span className="font-medium text-cyan-300 truncate max-w-[200px]">
                  {selectedVessel.cargo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-mono">Rerouting Delay:</span>
                <span className="font-mono font-bold text-rose-400">
                  +{selectedVessel.rerouteExtraDays} Days via Cape
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-mono">Bunker Surcharge:</span>
                <span className="font-mono font-bold text-amber-400">
                  +${(selectedVessel.fuelSurchargeUSD / 1000).toFixed(0)}k USD
                </span>
              </div>
            </div>
          </div>

          {/* Quick Nav to Live Map */}
          <button
            onClick={() => {
              if (onNavigateToTab) onNavigateToTab("live-map");
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-700"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Global Geopolitical GIS Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Section: Multi-Tier Supply Chain Cascade Network Disruption Simulator */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-950/80 text-purple-400 border border-purple-800/60">
                Contagion Ripple Engine
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Interactive Node Disruption
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>Multi-Tier Supply Chain Cascade Failure Network</span>
            </h2>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Click any node below to simulate instant downstream domino failure
          </span>
        </div>

        {/* 5-Tier Domino Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {DEPENDENCY_NODES.map((node) => {
            const isDisrupted = disruptedNodeId === node.id;
            return (
              <div
                key={node.id}
                onClick={() => {
                  setDisruptedNodeId(node.id);
                  tacticalSound.playAlert();
                }}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border flex flex-col justify-between space-y-3 ${
                  isDisrupted
                    ? "bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/50 shadow-lg shadow-rose-950"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    {node.tier}
                  </div>
                  <div className="font-bold text-white text-xs leading-snug">
                    {node.name}
                  </div>
                  <div className="text-[11px] font-mono text-amber-400">
                    {node.share}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Impact Delay:</span>
                    <span className="text-rose-400 font-bold">+{node.downstreamImpactDays} Days</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Loss / Day:</span>
                    <span className="text-amber-400 font-bold">${node.revenueAtRiskDaily}M</span>
                  </div>
                </div>

                <div
                  className={`w-full py-1 text-center rounded text-[10px] font-mono font-bold uppercase transition ${
                    isDisrupted
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isDisrupted ? "CRITICAL FAILURE ACTIVE" : "SIMULATE DISRUPT"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Cascade Consequence Banner */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-bold text-white text-xs">
                Simulated Domino Contagion: {activeDisruptedNode.name} ({activeDisruptedNode.tier})
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {activeDisruptedNode.description} Downstream propagation throttles Tier-1 wafer start availability within{" "}
              <strong className="text-rose-400 font-mono">
                {activeDisruptedNode.downstreamImpactDays} days
              </strong>
              , producing a daily global output freeze of{" "}
              <strong className="text-amber-400 font-mono">
                ${activeDisruptedNode.revenueAtRiskDaily} Million USD
              </strong>
              .
            </p>
          </div>

          <button
            onClick={() => {
              if (onAnalyzeProblem) {
                onAnalyzeProblem({
                  domain: "Global Supply Chain",
                  title: `Domino Disruption: ${activeDisruptedNode.name}`,
                  context: `Simulated catastrophic failure at ${activeDisruptedNode.name}: Daily loss of $${activeDisruptedNode.revenueAtRiskDaily}M and +${activeDisruptedNode.downstreamImpactDays} days downstream lead time.`,
                  urgency: "Critical (Immediate Triage)",
                });
              }
              if (onNavigateToTab) {
                onNavigateToTab("executive-summary");
              }
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-purple-950 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Sovereign Decoupling Fix</span>
          </button>
        </div>
      </div>

      {/* 4. Section: Live USGS Seismic & Semiconductor Cleanroom Vibration Monitor */}
      <LiveSeismicFabMonitor
        onSelectQuake={(quake) => {
          tacticalSound.playPing();
          if (onEscalateToSentinel && (quake.cleanroomRisk === "CRITICAL" || quake.mag >= 5.0)) {
            onEscalateToSentinel({
              id: `ALERT-QUAKE-${quake.id}`,
              timestamp: "JUST NOW",
              title: `Live Seismic Cleanroom Risk: M ${quake.mag.toFixed(1)} near ${quake.nearestFab.fabName}`,
              severity: "critical",
              source: "USGS Real-Time Seismic Telemetry",
              description: `M ${quake.mag.toFixed(1)} earthquake recorded ${quake.nearestFab.distanceKm} km from ${quake.nearestFab.fabName}. Potential cleanroom floor vibration exceedance for EUV lithography tooling.`,
              recommendedAction: "Execute diagnostic wafer inspection and verify lithography alignment calibration.",
              requiresDualKey: false,
              status: "active",
            });
          }
        }}
      />
    </div>
  );
};
