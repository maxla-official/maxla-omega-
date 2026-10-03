import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface NearestFabInfo {
  fabId: string;
  fabName: string;
  fabCountry: string;
  distanceKm: number;
}

export interface LiveEarthquake {
  id: string;
  mag: number;
  place: string;
  time: number;
  updated: number;
  url: string;
  felt: number;
  tsunami: boolean;
  coordinates: [number, number]; // [lat, lon]
  depthKm: number;
  nearestFab: NearestFabInfo;
  cleanroomRisk: "CRITICAL" | "ELEVATED" | "NOMINAL";
}

export interface LiveMarketQuoteItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high24h?: number;
  low24h?: number;
  volume?: string | number;
  currency?: string;
  source?: string;
}

export interface SpaceWeatherAlert {
  issueTime: string;
  message: string;
  product_id: string;
}

export interface LiveTelemetryData {
  earthquakes: LiveEarthquake[];
  totalQuakesCount?: number;
  nearestMalaccaQuake?: {
    id: string;
    place: string;
    mag: number;
    time?: number;
    distanceKm: number;
    coordinates?: [number, number];
  };
  fxRates: Record<string, number>;
  cryptoPrices: Record<string, { price: number; change24h: number }>;
  spaceWeather: SpaceWeatherAlert[];
  marketQuotes?: LiveMarketQuoteItem[];
  timestamp: number;
}

interface LiveTelemetryContextType {
  data: LiveTelemetryData;
  isLoading: boolean;
  isLive: boolean;
  latencyMs: number;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  toggleAutoRefresh: () => void;
  autoRefreshEnabled: boolean;
}

const DEFAULT_TELEMETRY: LiveTelemetryData = {
  earthquakes: [],
  fxRates: {
    EUR: 1.0838,
    JPY: 152.65,
    INR: 86.85,
    CNY: 7.24,
    GBP: 1.298,
    SGD: 1.345,
    KRW: 1380.5,
    TWD: 32.15,
  },
  cryptoPrices: {
    BTCUSDT: { price: 84040, change24h: 1.85 },
    ETHUSDT: { price: 2620, change24h: -0.45 },
    SOLUSDT: { price: 154.2, change24h: 3.12 },
  },
  spaceWeather: [],
  timestamp: Date.now(),
};

const LiveTelemetryContext = createContext<LiveTelemetryContextType>({
  data: DEFAULT_TELEMETRY,
  isLoading: false,
  isLive: true,
  latencyMs: 32,
  lastUpdated: null,
  refresh: async () => {},
  toggleAutoRefresh: () => {},
  autoRefreshEnabled: true,
});

export const LiveTelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<LiveTelemetryData>(DEFAULT_TELEMETRY);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number>(35);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(true);

  const fetchTelemetry = useCallback(async () => {
    const startTime = performance.now();
    try {
      setIsLoading(true);
      const [res, quotesRes] = await Promise.allSettled([
        fetch("/api/live/telemetry"),
        fetch("/api/market/quotes"),
      ]);

      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(Math.max(12, elapsed));

      let newQuotes: LiveMarketQuoteItem[] | undefined = undefined;
      if (quotesRes.status === "fulfilled" && quotesRes.value.ok) {
        try {
          const qJson = await quotesRes.value.json();
          if (Array.isArray(qJson.quotes)) {
            newQuotes = qJson.quotes;
          }
        } catch {}
      }

      if (res.status === "fulfilled" && res.value.ok) {
        const json = await res.value.json();
        if (json?.data) {
          setData({
            ...json.data,
            marketQuotes: newQuotes || json.data.marketQuotes,
          });
          setLastUpdated(new Date());
          setIsLive(true);
        }
      } else if (newQuotes) {
        setData((prev) => ({
          ...prev,
          marketQuotes: newQuotes,
        }));
        setLastUpdated(new Date());
        setIsLive(true);
      }
    } catch (err) {
      console.warn("Live telemetry fetch fallback:", err);
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh cadence (every 12 seconds)
  useEffect(() => {
    fetchTelemetry();
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      fetchTelemetry();
    }, 12000);

    return () => clearInterval(interval);
  }, [fetchTelemetry, autoRefreshEnabled]);

  // 2. Direct USGS Real-Time Seismic Sync with Malacca Strait tracking
  useEffect(() => {
    fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray(d.features)) {
          // Update matching DOM elements containing USGS to real count
          document.querySelectorAll('*').forEach((el) => {
            if (
              el.textContent &&
              el.textContent.includes('USGS') &&
              (el.children.length === 0 || (el.children.length === 1 && el.firstElementChild?.tagName === 'SPAN'))
            ) {
              el.textContent = 'USGS Real-Time: ' + d.features.length + ' Quakes Live';
            }
          });

          const list = d.features.slice(0, 3).map((f: any) => f.properties?.place + ' M' + f.properties?.mag).join(' | ');
          console.log('Real quakes:', list);

          // Find nearest quake to Malacca Strait (lat: 2.15, lng: 102.12)
          let nearestMalacca: any = null;
          let minDist = Infinity;
          for (const f of d.features) {
            const coords = f.geometry?.coordinates || [0, 0];
            const dLat = (coords[1] - 2.15) * (Math.PI / 180);
            const dLon = (coords[0] - 102.12) * (Math.PI / 180);
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(2.15 * (Math.PI / 180)) * Math.cos(coords[1] * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const distKm = Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
            if (distKm < minDist) {
              minDist = distKm;
              nearestMalacca = {
                id: f.id,
                place: f.properties?.place || "Near Malacca Strait",
                mag: Number((f.properties?.mag || 0).toFixed(1)),
                time: f.properties?.time,
                distanceKm: distKm,
                coordinates: [coords[1], coords[0]],
              };
            }
          }

          setData((prev) => ({
            ...prev,
            totalQuakesCount: d.features.length,
            nearestMalaccaQuake: nearestMalacca || prev.nearestMalaccaQuake,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled((prev) => !prev);
  };

  return (
    <LiveTelemetryContext.Provider
      value={{
        data,
        isLoading,
        isLive,
        latencyMs,
        lastUpdated,
        refresh: fetchTelemetry,
        toggleAutoRefresh,
        autoRefreshEnabled,
      }}
    >
      {children}
    </LiveTelemetryContext.Provider>
  );
};

export const useLiveTelemetry = () => useContext(LiveTelemetryContext);
