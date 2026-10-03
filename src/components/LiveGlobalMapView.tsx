import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Globe,
  Compass,
  AlertTriangle,
  Shield,
  Layers,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  Send,
  Sliders,
  Anchor,
  Cpu,
  Building2,
  Ship,
  Navigation,
  ExternalLink,
  PlusCircle,
  X,
  CheckCircle2,
  Activity,
  Flame,
  ShieldAlert,
} from "lucide-react";
import {
  GeoIntelligenceNode,
  TransitRoute,
  INITIAL_GEO_NODES,
  INITIAL_TRANSIT_ROUTES,
} from "../data/mapIntelligenceData";
import { AuthorityAlert, ProblemInput } from "../types";
import { useLiveTelemetry } from "../context/LiveTelemetryContext";

interface LiveGlobalMapViewProps {
  onEscalateToSentinel?: (alert: AuthorityAlert) => void;
  onAnalyzeProblem?: (problem: Partial<ProblemInput>) => void;
}

export const LiveGlobalMapView: React.FC<LiveGlobalMapViewProps> = ({
  onEscalateToSentinel,
  onAnalyzeProblem,
}) => {
  const { data: liveTelemetry } = useLiveTelemetry();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const seismicLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  // Basemap tile provider
  type TileProvider = "osm-standard" | "osm-dark" | "osm-topo";
  const [tileProvider, setTileProvider] = useState<TileProvider>("osm-standard");

  // Data states - upgraded to full 35 real geopolitical & semiconductor points
  const [nodes, setNodes] = useState<GeoIntelligenceNode[]>(() => {
    try {
      const saved = localStorage.getItem("maxla_geo_nodes_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_GEO_NODES.length) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_GEO_NODES;
  });

  const [routes, setRoutes] = useState<TransitRoute[]>(INITIAL_TRANSIT_ROUTES);
  const [selectedNode, setSelectedNode] = useState<GeoIntelligenceNode | null>(nodes[0]);
  const [selectedRoute, setSelectedRoute] = useState<TransitRoute | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [nominatimNotice, setNominatimNotice] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [showChokepoints, setShowChokepoints] = useState(true);
  const [showSemiconductor, setShowSemiconductor] = useState(true);
  const [showFinance, setShowFinance] = useState(true);
  const [showLogistics, setShowLogistics] = useState(true);
  const [showEnergy, setShowEnergy] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showSeismic, setShowSeismic] = useState(true);
  const [isSimulatingLiveTelemetry, setIsSimulatingLiveTelemetry] = useState(true);
  const [lastTelemetryTimestamp, setLastTelemetryTimestamp] = useState<string>("Just now");
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
  const [escalatedNotice, setEscalatedNotice] = useState<string | null>(null);

  // Quick Strategic Target Presets
  const quickTargets = ["Strait of Malacca", "Suez Canal", "TSMC Hsinchu", "Panama Canal", "ASML HQ"];

  // 3. OpenStreetMap Nominatim Search (Villages, Cities, Landmarks e.g. Ujjain, Indore)
  const handleExecutePlaceSearch = async (queryText = searchQuery) => {
    const q = queryText.trim();
    if (!q) return;

    // A. Check if matching any local geopolitical chokepoint or node
    const qLower = q.toLowerCase();
    const matchingNode = nodes.find(
      (n) =>
        n.name.toLowerCase().includes(qLower) ||
        (qLower.includes("asml") && n.id === "NODE-ASML-VELDHOVEN") ||
        (qLower.includes("panama") && n.id === "NODE-PANAMA-CANAL") ||
        (qLower.includes("malacca") && n.id === "NODE-STRAIT-MALACCA") ||
        (qLower.includes("suez") && n.id === "NODE-SUEZ") ||
        (qLower.includes("hsinchu") && n.id === "NODE-TSMC-HSINCHU") ||
        n.primaryCommodity.toLowerCase().includes(qLower) ||
        n.region.toLowerCase().includes(qLower)
    );

    if (matchingNode) {
      setSelectedNode(matchingNode);
      setSelectedRoute(null);
      flyToCoords(matchingNode.coordinates, 8);
      return;
    }

    // B. Call OpenStreetMap Nominatim for real villages, cities, or global coordinates
    try {
      setIsSearchingPlace(true);
      setNominatimNotice(`Locating "${q}" via OpenStreetMap Nominatim...`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`,
        { headers: { "User-Agent": "MaxlaGeopoliticalApp/1.0" } }
      );
      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) {
          const topResult = results[0];
          const lat = parseFloat(topResult.lat);
          const lon = parseFloat(topResult.lon);

          if (!isNaN(lat) && !isNaN(lon) && mapInstanceRef.current) {
            // Fly map to result at zoom 18 as requested!
            mapInstanceRef.current.flyTo([lat, lon], 18, { duration: 1.8 });

            // Remove existing search pin if any
            if (searchMarkerRef.current) {
              mapInstanceRef.current.removeLayer(searchMarkerRef.current);
            }

            // Create target pin
            const searchIcon = L.divIcon({
              className: "custom-search-place-marker",
              html: `
                <div class="relative flex items-center justify-center cursor-pointer">
                  <div class="absolute -inset-3 rounded-full bg-cyan-400/40 animate-ping"></div>
                  <div class="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-white shadow-2xl">
                    📍
                  </div>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });

            const newMarker = L.marker([lat, lon], { icon: searchIcon }).addTo(mapInstanceRef.current);
            newMarker.bindTooltip(
              `<div class="font-sans text-xs px-2 py-1.5 text-slate-100 bg-slate-950/95 border border-cyan-500 rounded-lg shadow-2xl min-w-[200px]">
                <div class="font-bold text-cyan-400 text-[10px] uppercase font-mono">OSM Nominatim Target (Zoom 18)</div>
                <div class="font-bold text-white text-xs mt-0.5">${topResult.display_name}</div>
                <div class="text-[10px] font-mono text-slate-400 mt-1">${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E</div>
              </div>`,
              { permanent: true, direction: "top", offset: [0, -16] }
            );

            searchMarkerRef.current = newMarker;

            // Generate target node for the Target Telemetry Inspector
            const placeNode: GeoIntelligenceNode = {
              id: `OSM-${Date.now()}`,
              name: topResult.name || q,
              category: "chokepoint",
              coordinates: [lat, lon],
              region: "Global",
              status: "nominal",
              riskScore: 22,
              dailyThroughputUSD: "Regional Economic Node",
              primaryCommodity: "Local Supply Infrastructure",
              lastTelemetryUpdate: "Just now via OpenStreetMap Nominatim",
              currentIncident: `High-resolution OSM telemetry pinpointed: ${topResult.display_name}`,
              recommendedMitigation: "Local logistics hub connectivity verified. Monitor regional highway and rail corridors.",
            };

            setSelectedNode(placeNode);
            setSelectedRoute(null);
            setNominatimNotice(`Pinned: ${topResult.display_name.slice(0, 52)} (Zoom 18)`);
            setTimeout(() => setNominatimNotice(null), 6000);
            return;
          }
        } else {
          setNominatimNotice(`No place found for "${q}". Try another village or city.`);
          setTimeout(() => setNominatimNotice(null), 4000);
        }
      }
    } catch {
      setNominatimNotice("Network error searching Nominatim. Please retry.");
      setTimeout(() => setNominatimNotice(null), 4000);
    } finally {
      setIsSearchingPlace(false);
    }
  };

  // New Node Form State
  const [newNodeForm, setNewNodeForm] = useState<{
    name: string;
    category: GeoIntelligenceNode["category"];
    latitude: string;
    longitude: string;
    region: GeoIntelligenceNode["region"];
    status: GeoIntelligenceNode["status"];
    riskScore: number;
    dailyThroughputUSD: string;
    primaryCommodity: string;
    currentIncident: string;
    recommendedMitigation: string;
  }>({
    name: "",
    category: "chokepoint",
    latitude: "25.0",
    longitude: "55.0",
    region: "Middle East",
    status: "critical",
    riskScore: 85,
    dailyThroughputUSD: "$5.0B / day",
    primaryCommodity: "Petroleum & Microchips",
    currentIncident: "Unscheduled supply congestion and security patrol alert.",
    recommendedMitigation: "Activate secondary routing protocol.",
  });

  // Persist nodes
  useEffect(() => {
    try {
      localStorage.setItem("maxla_geo_nodes_v3", JSON.stringify(nodes));
    } catch {}
  }, [nodes]);

  // Telemetry ticker simulation
  useEffect(() => {
    if (!isSimulatingLiveTelemetry) return;
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastTelemetryTimestamp(now);

      // Random jitter on risk score of one random node to simulate live sensor feed
      setNodes((prev) => {
        const randomIndex = Math.floor(Math.random() * prev.length);
        return prev.map((node, i) => {
          if (i === randomIndex) {
            const delta = Math.floor(Math.random() * 3) - 1;
            const newScore = Math.min(99, Math.max(15, node.riskScore + delta));
            return {
              ...node,
              riskScore: newScore,
              lastTelemetryUpdate: "Just now",
            };
          }
          return node;
        });
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [isSimulatingLiveTelemetry]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Reset container if previous instance left _leaflet_id
    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    try {
      // Create Leaflet map centered on global geopolitical chokepoint corridor
      const map = L.map(mapContainerRef.current, {
        center: [20, 30],
        zoom: 3,
        minZoom: 2,
        maxZoom: 19,
        zoomControl: false,
        attributionControl: true,
      });

      // Layer groups for dynamic markers and polylines
      const markersGroup = L.layerGroup().addTo(map);
      const routesGroup = L.layerGroup().addTo(map);
      const seismicGroup = L.layerGroup().addTo(map);

      markersLayerGroupRef.current = markersGroup;
      routesLayerGroupRef.current = routesGroup;
      seismicLayerGroupRef.current = seismicGroup;
      mapInstanceRef.current = map;

      // Invalidate size once rendered
      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch {}
      }, 250);

      // Handle container resize cleanly with animation frame debouncing
      let rAF: number | null = null;
      const resizeObserver = new ResizeObserver(() => {
        if (rAF) cancelAnimationFrame(rAF);
        rAF = requestAnimationFrame(() => {
          try {
            map.invalidateSize();
          } catch {}
        });
      });
      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current);
      }

      // Cleanup on unmount
      return () => {
        if (rAF) cancelAnimationFrame(rAF);
        resizeObserver.disconnect();
        try {
          map.remove();
        } catch (e) {
          console.warn("Leaflet cleanup notice:", e);
        }
        mapInstanceRef.current = null;
        if (mapContainerRef.current) {
          try {
            (mapContainerRef.current as any)._leaflet_id = null;
          } catch {}
        }
      };
    } catch (err) {
      console.warn("Leaflet map initialization guarded:", err);
    }
  }, []);

  // Update Tile Layer based on tileProvider state (OpenStreetMap Default)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
      currentTileLayerRef.current = null;
    }

    let url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';
    let maxZoom = 19;
    let subdomains: string | string[] = "abc";

    if (tileProvider === "osm-standard") {
      url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';
      maxZoom = 19;
    } else if (tileProvider === "osm-dark") {
      url = "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png";
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; CARTO';
      maxZoom = 19;
      subdomains = "abcd";
    } else if (tileProvider === "osm-topo") {
      url = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
      attribution = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors, SRTM | Map style: &copy; OpenTopoMap';
      maxZoom = 17;
      subdomains = "abc";
    }

    const newLayer = L.tileLayer(url, {
      maxZoom,
      subdomains,
      attribution,
    }).addTo(map);

    currentTileLayerRef.current = newLayer;
  }, [tileProvider]);

  // Update Markers & Polylines when filters or data change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    const routesGroup = routesLayerGroupRef.current;
    const seismicGroup = seismicLayerGroupRef.current;
    if (!map || !markersGroup || !routesGroup) return;

    markersGroup.clearLayers();
    routesGroup.clearLayers();
    if (seismicGroup) seismicGroup.clearLayers();

    // 0. Render Real Live USGS Earthquakes with Cleanroom Distance Calculation
    if (showSeismic && seismicGroup && liveTelemetry?.earthquakes) {
      liveTelemetry.earthquakes.forEach((quake) => {
        const isCritical = quake.cleanroomRisk === "CRITICAL" || quake.mag >= 5.0;
        const color = isCritical ? "bg-rose-500" : quake.mag >= 4.0 ? "bg-amber-400" : "bg-cyan-400";
        const ring = isCritical ? "ring-rose-500/60" : "ring-amber-400/40";

        const seismicHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="absolute -inset-2 rounded-full ${color}/40 animate-ping"></div>
            <div class="w-3.5 h-3.5 rounded-full ${color} ring-2 ${ring} flex items-center justify-center shadow-lg shadow-black/80">
              <div class="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: "custom-usgs-seismic-blip",
          html: seismicHtml,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker(quake.coordinates, { icon });
        marker.bindTooltip(
          `<div class="font-sans text-xs px-2 py-1.5 text-slate-100 bg-slate-950/95 border border-slate-700 rounded-lg shadow-2xl min-w-[200px]">
            <div class="flex items-center justify-between font-mono font-bold text-rose-400 text-[10px]">
              <span>USGS SEISMIC • M ${quake.mag.toFixed(1)}</span>
              <span>Depth: ${quake.depthKm} km</span>
            </div>
            <div class="font-bold text-white text-xs mt-0.5">${quake.place}</div>
            <div class="text-[11px] text-slate-300 mt-1 border-t border-slate-800 pt-1">
              Nearest Fab: <strong class="text-amber-300">${quake.nearestFab?.fabName}</strong> (${quake.nearestFab?.distanceKm} km)
            </div>
            <div class="text-[10px] font-mono mt-0.5 ${isCritical ? 'text-rose-400 font-bold' : 'text-emerald-400'}">
              Cleanroom Exposure: ${quake.cleanroomRisk}
            </div>
          </div>`,
          { direction: "top", offset: [0, -10] }
        );

        seismicGroup.addLayer(marker);
      });
    }

    // 1. Render Transit Polylines & Waypoint Live Nodes (No empty link without points!)
    if (showRoutes) {
      routes.forEach((route) => {
        const isRouteSelected = selectedRoute?.id === route.id;
        const color =
          route.status === "blocked"
            ? "#ef4444"
            : route.status === "rerouting"
            ? "#f59e0b"
            : route.status === "congested"
            ? "#38bdf8"
            : "#10b981";

        const polyline = L.polyline(route.waypoints, {
          color: color,
          weight: isRouteSelected ? 4 : 2.5,
          opacity: isRouteSelected ? 1 : 0.75,
          dashArray: route.status === "rerouting" ? "6, 8" : undefined,
        });

        polyline.on("click", () => {
          setSelectedRoute(route);
          setSelectedNode(null);
        });

        polyline.bindTooltip(
          `<div class="text-xs font-semibold px-1 py-0.5">${route.name} (${route.flowVolume})</div>`,
          { sticky: true }
        );

        routesGroup.addLayer(polyline);

        // Place live waypoint marker dots along the route so that every waypoint has a live beacon point
        route.waypoints.forEach((coord, wpIdx) => {
          // Check if this waypoint already matches an existing node marker
          const matchesExistingNode = nodes.some(
            (n) => Math.abs(n.coordinates[0] - coord[0]) < 0.25 && Math.abs(n.coordinates[1] - coord[1]) < 0.25
          );

          if (!matchesExistingNode) {
            const wpPulseHtml = `
              <div class="relative flex items-center justify-center cursor-pointer group">
                <div class="map-live-beacon bg-indigo-500/50"></div>
                <div class="map-live-beacon-secondary bg-sky-400/30"></div>
                <div class="w-3.5 h-3.5 rounded-full bg-indigo-600 ring-2 ring-sky-300 shadow-lg shadow-black/80 flex items-center justify-center map-node-core-glow text-sky-400">
                  <div class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
                </div>
              </div>
            `;

            const wpIcon = L.divIcon({
              className: "custom-route-waypoint-marker",
              html: wpPulseHtml,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            });

            const wpMarker = L.marker(coord, { icon: wpIcon });
            wpMarker.on("click", () => {
              setSelectedRoute(route);
              setSelectedNode(null);
            });

            wpMarker.bindTooltip(
              `<div class="font-sans font-semibold text-xs px-1 text-slate-100">
                <div class="flex items-center justify-between gap-1 text-[10px] text-sky-400 font-mono font-bold uppercase">
                  <span>WAYPOINT ${wpIdx + 1}</span>
                  <span class="text-emerald-400">• LIVE ROUTE</span>
                </div>
                <div class="text-xs font-bold text-white mt-0.5">${route.name}</div>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">${coord[0].toFixed(3)}°N, ${coord[1].toFixed(3)}°E • Status: ${route.status.toUpperCase()}</div>
              </div>`,
              { direction: "top", offset: [0, -8] }
            );

            routesGroup.addLayer(wpMarker);
          }
        });
      });
    }

    // 2. Filter Nodes (if query matches an existing node, filter to it; otherwise retain nodes)
    const hasMatchingExistingNode =
      searchQuery.trim().length > 0 &&
      nodes.some((node) => {
        const q = searchQuery.toLowerCase();
        return (
          node.name.toLowerCase().includes(q) ||
          node.primaryCommodity.toLowerCase().includes(q) ||
          node.region.toLowerCase().includes(q)
        );
      });

    const filteredNodes = nodes.filter((node) => {
      if (hasMatchingExistingNode) {
        const q = searchQuery.toLowerCase();
        const matchesName = node.name.toLowerCase().includes(q);
        const matchesCommodity = node.primaryCommodity.toLowerCase().includes(q);
        const matchesRegion = node.region.toLowerCase().includes(q);
        if (!matchesName && !matchesCommodity && !matchesRegion) return false;
      }
      if (filterCategory !== "all" && node.category !== filterCategory) return false;
      if (filterSeverity !== "all" && node.status !== filterSeverity) return false;
      if (!showChokepoints && node.category === "chokepoint") return false;
      if (!showSemiconductor && node.category === "semiconductor") return false;
      if (!showFinance && node.category === "finance") return false;
      if (!showLogistics && node.category === "logistics") return false;
      if (!showEnergy && node.category === "energy") return false;
      return true;
    });

    // 3. Render Custom Glowing Markers with Active Pulsing Live Lights for ALL points!
    filteredNodes.forEach((node) => {
      const isSelected = selectedNode?.id === node.id;
      const isCritical = node.status === "critical";
      const isDisrupted = node.status === "disrupted";
      const isElevated = node.status === "elevated_risk";

      // Live light radiation colors
      const beaconColor = isCritical
        ? "bg-rose-500/70"
        : isDisrupted
        ? "bg-amber-500/60"
        : isElevated
        ? "bg-cyan-400/60"
        : "bg-emerald-400/60";

      const beaconSecondary = isCritical
        ? "bg-rose-600/40"
        : isDisrupted
        ? "bg-amber-600/35"
        : isElevated
        ? "bg-cyan-500/35"
        : "bg-emerald-500/30";

      const ringColor = isCritical
        ? "bg-rose-500 ring-rose-400 text-rose-400"
        : isDisrupted
        ? "bg-amber-500 ring-amber-400 text-amber-400"
        : isElevated
        ? "bg-cyan-500 ring-cyan-400 text-cyan-400"
        : "bg-emerald-500 ring-emerald-400 text-emerald-400";

      const pulseHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <!-- Animated Live Light Wave 1 -->
          <div class="map-live-beacon ${beaconColor}"></div>
          <!-- Animated Live Light Wave 2 -->
          <div class="map-live-beacon-secondary ${beaconSecondary}"></div>
          
          <!-- Core Live Beacon Hub -->
          <div class="w-5 h-5 rounded-full ${ringColor} ${
        isSelected ? "ring-4 scale-125" : "ring-2 group-hover:scale-110"
      } shadow-xl shadow-black/90 flex items-center justify-center transition-all duration-200 map-node-core-glow">
            <div class="w-2 h-2 rounded-full bg-white shadow-sm shadow-white"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: pulseHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(node.coordinates, { icon: customIcon });

      marker.on("click", () => {
        setSelectedNode(node);
        setSelectedRoute(null);
      });

      marker.bindTooltip(
        `<div class="font-sans font-semibold text-xs px-1 text-slate-100 min-w-[180px]">
          <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-1">
            <span class="text-[10px] uppercase tracking-wider text-slate-400 font-mono">${node.category}</span>
            <span class="text-[10px] font-bold ${isCritical ? 'text-rose-400' : isDisrupted ? 'text-amber-400' : isElevated ? 'text-cyan-400' : 'text-emerald-400'} uppercase flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-rose-400' : isDisrupted ? 'bg-amber-400' : isElevated ? 'bg-cyan-400' : 'bg-emerald-400'} animate-ping"></span>
              LIVE
            </span>
          </div>
          <div class="text-sm font-bold text-white">${node.name}</div>
          <div class="text-[11px] text-slate-300 mt-1">${node.primaryCommodity}</div>
          <div class="flex items-center justify-between mt-1 text-[10px] font-mono">
            <span class="text-slate-400">Flow: ${node.dailyThroughputUSD}</span>
            <span class="${isCritical ? 'text-rose-400' : 'text-amber-400'} font-bold">Risk: ${node.riskScore}/100</span>
          </div>
        </div>`,
        { direction: "top", offset: [0, -10] }
      );

      markersGroup.addLayer(marker);
    });
  }, [
    nodes,
    routes,
    selectedNode,
    selectedRoute,
    searchQuery,
    filterCategory,
    filterSeverity,
    showChokepoints,
    showSemiconductor,
    showFinance,
    showLogistics,
    showEnergy,
    showRoutes,
    showSeismic,
    liveTelemetry?.earthquakes,
  ]);

  // Helper to fly to coordinates
  const flyToCoords = (coords: [number, number], zoom = 5) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, zoom, { duration: 1.2 });
    }
  };

  // Quick region focuses
  const handleJumpRegion = (region: string) => {
    if (!mapInstanceRef.current) return;
    switch (region) {
      case "global":
        mapInstanceRef.current.flyTo([20, 20], 3, { duration: 1.2 });
        break;
      case "middle-east":
        mapInstanceRef.current.flyTo([22.0, 48.0], 5, { duration: 1.2 });
        break;
      case "asia-pacific":
        mapInstanceRef.current.flyTo([18.0, 115.0], 4.5, { duration: 1.2 });
        break;
      case "europe":
        mapInstanceRef.current.flyTo([50.0, 10.0], 4.5, { duration: 1.2 });
        break;
      case "americas":
        mapInstanceRef.current.flyTo([22.0, -90.0], 4, { duration: 1.2 });
        break;
    }
  };

  // Escalate to sentinel
  const handleEscalateCurrentNode = () => {
    if (!selectedNode) return;
    const alert: AuthorityAlert = {
      id: `MAP-ALERT-${Date.now().toString().slice(-4)}`,
      timestamp: "Just Now",
      title: `Global Geopolitical Disruption: ${selectedNode.name}`,
      severity: selectedNode.riskScore > 85 ? "critical" : "high",
      source: "Global Live Geopolitical Map",
      description: `Tactical telemetry indicates high systemic strain at ${selectedNode.name} (${selectedNode.region}). Daily throughput impact: ${selectedNode.dailyThroughputUSD}. Incident: ${selectedNode.currentIncident || "Elevated chokepoint threat"}`,
      recommendedAction: selectedNode.recommendedMitigation,
      requiresDualKey: selectedNode.riskScore > 85,
      status: "active",
    };

    if (onEscalateToSentinel) {
      onEscalateToSentinel(alert);
      setEscalatedNotice(`Escalated "${selectedNode.name}" to Decision Center.`);
      setTimeout(() => setEscalatedNotice(null), 3500);
    }
  };

  // Analyze in MECE Framework
  const handleAnalyzeCurrentNode = () => {
    if (!selectedNode) return;
    const problemInput: Partial<ProblemInput> = {
      title: `Strategic Mitigation: ${selectedNode.name} Interruption`,
      domain: "Global Supply Chain",
      urgency: selectedNode.riskScore > 80 ? "Critical (Immediate Triage)" : "High (90-Day Sprint)",
      context: `Live Geo Intelligence detected acute bottleneck at ${selectedNode.name}. Daily flow at risk: ${selectedNode.dailyThroughputUSD}. Current status: ${selectedNode.status.toUpperCase()}. Issue: ${selectedNode.currentIncident || "Severe logistic divergence."}`,
      constraints: [
        `Mitigate ${selectedNode.dailyThroughputUSD} daily trade disruption within 14 days`,
        "Comply with maritime war-risk insurance underwriting guidelines",
        "Maintain dual-source supply buffer across allied geographic hubs",
      ],
    };

    if (onAnalyzeProblem) {
      onAnalyzeProblem(problemInput);
    }
  };

  // Add custom node
  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(newNodeForm.latitude);
    const lng = parseFloat(newNodeForm.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    const newNode: GeoIntelligenceNode = {
      id: `NODE-USER-${Date.now().toString().slice(-4)}`,
      name: newNodeForm.name || "Custom Strategic Node",
      category: newNodeForm.category,
      coordinates: [lat, lng],
      region: newNodeForm.region,
      status: newNodeForm.status,
      riskScore: Number(newNodeForm.riskScore),
      dailyThroughputUSD: newNodeForm.dailyThroughputUSD,
      primaryCommodity: newNodeForm.primaryCommodity,
      currentIncident: newNodeForm.currentIncident,
      recommendedMitigation: newNodeForm.recommendedMitigation,
      lastTelemetryUpdate: "Just now",
    };

    setNodes((prev) => [newNode, ...prev]);
    setSelectedNode(newNode);
    setIsAddNodeModalOpen(false);
    flyToCoords([lat, lng], 6);
  };

  // Stats
  const criticalCount = nodes.filter((n) => n.status === "critical").length;
  const disruptedCount = nodes.filter((n) => n.status === "disrupted" || n.status === "elevated_risk").length;
  const totalThroughputAtRisk = "$68.1B / day";

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl relative">
      {/* Top Tactical Command Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Globe className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Live Geopolitical & Supply Chain Intelligence Map
              </h2>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LEAFLET + OPENSTREETMAP
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Engine: Leaflet v1.9 • Map Data: OpenStreetMap contributors</span>
              <span>•</span>
              <span className="text-slate-300 font-mono">Synced {lastTelemetryTimestamp}</span>
            </p>
          </div>
        </div>

        {/* Tactical Key Metrics */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto text-xs">
          <div className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-mono font-bold">{criticalCount}</span> Critical Chokepoints
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-bold">{disruptedCount}</span> Elevated Risk
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center gap-1.5">
            <Ship className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono font-bold">570+</span> Tracked Vessels
          </div>
          <button
            id="map-add-node-btn"
            onClick={() => setIsAddNodeModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-900/40"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Pin Custom Hotspot</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage & Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Map Canvas */}
        <div className="flex-1 relative h-full min-h-[400px]">
          {/* Leaflet container */}
          <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-950" />

          {/* Floating Map Navigation & Region Buttons */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/70 shadow-xl">
            <span className="text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3 text-indigo-400" /> Region:
            </span>
            <button
              onClick={() => handleJumpRegion("global")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              Global
            </button>
            <button
              onClick={() => handleJumpRegion("middle-east")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Red Sea / Gulf
            </button>
            <button
              onClick={() => handleJumpRegion("asia-pacific")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              Asia-Pac / TSMC
            </button>
            <button
              onClick={() => handleJumpRegion("europe")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              Europe
            </button>
            <button
              onClick={() => handleJumpRegion("americas")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              Americas
            </button>
          </div>

          {/* Floating Zoom & Reset Controls */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/70 shadow-xl">
            <button
              id="map-zoom-in-btn"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              id="map-zoom-out-btn"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              id="map-reset-view-btn"
              onClick={() => handleJumpRegion("global")}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Reset View"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Layer Filters & OpenStreetMap Tile Switcher */}
          <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/70 shadow-xl text-xs">
            {/* Tile Switcher */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setTileProvider("osm-standard")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  tileProvider === "osm-standard"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="OpenStreetMap Standard Tiles"
              >
                OSM Standard
              </button>
              <button
                type="button"
                onClick={() => setTileProvider("osm-dark")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  tileProvider === "osm-dark"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="OSM Dark Matrix Tiles"
              >
                OSM Dark
              </button>
              <button
                type="button"
                onClick={() => setTileProvider("osm-topo")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  tileProvider === "osm-topo"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="OpenStreetMap Topography"
              >
                OSM Topo
              </button>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-2 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showChokepoints}
                  onChange={(e) => setShowChokepoints(e.target.checked)}
                  className="rounded accent-rose-500"
                />
                <span>Chokepoints</span>
              </label>
              <span className="text-slate-700">|</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showSemiconductor}
                  onChange={(e) => setShowSemiconductor(e.target.checked)}
                  className="rounded accent-cyan-500"
                />
                <span>Silicon Fabs</span>
              </label>
              <span className="text-slate-700">|</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showLogistics}
                  onChange={(e) => setShowLogistics(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span>Ports & Logistics</span>
              </label>
              <span className="text-slate-700">|</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showEnergy}
                  onChange={(e) => setShowEnergy(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span>Energy & Mines</span>
              </label>
              <span className="text-slate-700">|</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={(e) => setShowRoutes(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                <span>Vessel Corridors</span>
              </label>
              <span className="text-slate-700">|</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-rose-300 hover:text-white font-mono">
                <input
                  type="checkbox"
                  checked={showSeismic}
                  onChange={(e) => setShowSeismic(e.target.checked)}
                  className="rounded accent-rose-500"
                />
                <span className="font-bold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-rose-400" />
                  <span>USGS Quakes ({liveTelemetry.earthquakes.length})</span>
                </span>
              </label>
            </div>
          </div>

          {/* Floating Notice */}
          {escalatedNotice && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fade-in backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{escalatedNotice}</span>
            </div>
          )}
        </div>

        {/* Right Tactical Telemetry & Detail Inspector Panel */}
        <div className="w-full lg:w-96 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-auto lg:h-full z-10 overflow-y-auto">
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Target Telemetry Inspector
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {nodes.length} Targets Active
              </span>
            </div>

            {/* Quick Search with Village & Chokepoint Nominatim Support */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  id="target-telemetry-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleExecutePlaceSearch(searchQuery);
                    }
                  }}
                  placeholder="Type village (e.g. Ujjain, Indore) or chokepoint..."
                  className="w-full pl-9 pr-20 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 text-slate-400 hover:text-slate-200 transition"
                      title="Clear text"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    id="execute-place-search-btn"
                    type="button"
                    onClick={() => handleExecutePlaceSearch(searchQuery)}
                    disabled={isSearchingPlace || !searchQuery.trim()}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-[11px] font-bold text-white transition flex items-center gap-1 shadow-sm active:scale-95"
                    title="Search Village or Chokepoint"
                  >
                    {isSearchingPlace ? (
                      <RefreshCw className="w-3 h-3 animate-spin text-white" />
                    ) : (
                      <Navigation className="w-3 h-3" />
                    )}
                    <span>Go</span>
                  </button>
                </div>
              </div>

              {/* Strategic Quick Target Preset Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[10px]">
                <span className="text-slate-500 font-mono shrink-0">Quick Targets:</span>
                {quickTargets.map((place) => (
                  <button
                    key={place}
                    type="button"
                    onClick={() => {
                      setSearchQuery(place);
                      handleExecutePlaceSearch(place);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-indigo-950 hover:border-indigo-500/50 border border-slate-700/60 text-slate-300 hover:text-indigo-300 font-mono shrink-0 transition cursor-pointer"
                  >
                    {place}
                  </button>
                ))}
              </div>

              {nominatimNotice && (
                <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-[11px] text-cyan-200 flex items-center gap-1.5 animate-fadeIn">
                  <Activity className="w-3 h-3 text-cyan-400 shrink-0 animate-pulse" />
                  <span className="truncate">{nominatimNotice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Selected Target Details */}
          {selectedNode ? (
            <div className="p-4 flex-1 flex flex-col space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                      selectedNode.status === "critical"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : selectedNode.status === "disrupted"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : selectedNode.status === "elevated_risk"
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {selectedNode.status.replace("_", " ")}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {selectedNode.coordinates[0].toFixed(2)}°N, {selectedNode.coordinates[1].toFixed(2)}°E
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedNode.name}</h3>
                <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                  Region: {selectedNode.region} • Category: {selectedNode.category.toUpperCase()}
                </p>
              </div>

              {/* Risk Gauge */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Strategic Risk Index</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      selectedNode.riskScore >= 80
                        ? "text-rose-400"
                        : selectedNode.riskScore >= 60
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {selectedNode.riskScore} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      selectedNode.riskScore >= 80
                        ? "bg-rose-500"
                        : selectedNode.riskScore >= 60
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${selectedNode.riskScore}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                  <span>Throughput Exposure:</span>
                  <span className="font-mono font-bold text-slate-200">{selectedNode.dailyThroughputUSD}</span>
                </div>
              </div>

              {/* Key Commodity */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-1">Primary Trade Commodity:</span>
                <span className="font-semibold text-slate-200">{selectedNode.primaryCommodity}</span>
              </div>

              {/* Active Incident Alert */}
              {selectedNode.currentIncident && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Active Incident Advisory</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{selectedNode.currentIncident}</p>
                </div>
              )}

              {/* Recommended Strategic Mitigation */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Executive Mitigation Protocol</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedNode.recommendedMitigation}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 mt-auto">
                <button
                  id="map-focus-target-btn"
                  onClick={() => flyToCoords(selectedNode.coordinates, 6)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-700"
                >
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Center Target on Map</span>
                </button>

                <button
                  id="map-escalate-sentinel-btn"
                  onClick={handleEscalateCurrentNode}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>Escalate to Decision Center</span>
                </button>

                <button
                  id="map-analyze-strategy-btn"
                  onClick={handleAnalyzeCurrentNode}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/60"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Synthesize into MECE Framework</span>
                </button>
              </div>
            </div>
          ) : selectedRoute ? (
            /* Selected Transit Route Details */
            <div className="p-4 flex-1 flex flex-col space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  MARITIME LOGISTICS CORRIDOR
                </span>
                <h3 className="text-lg font-bold text-white mt-2">{selectedRoute.name}</h3>
                <p className="text-xs text-slate-400 mt-1">Status: {selectedRoute.status.toUpperCase()}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Throughput:</span>
                  <span className="font-mono font-bold text-slate-200">{selectedRoute.flowVolume}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tracked Freight Vessels:</span>
                  <span className="font-mono font-bold text-cyan-400">{selectedRoute.vesselsTracked} Ships</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Added Transit Delay:</span>
                  <span className="font-mono font-bold text-amber-400">+{selectedRoute.transitDelayDays} Days</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                <span className="text-slate-400 block mb-1">Waypoints Monitored:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                  {selectedRoute.waypoints.map((pt, i) => (
                    <li key={i}>
                      Waypoint {i + 1}: {pt[0].toFixed(2)}°N, {pt[1].toFixed(2)}°E
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedRoute(null)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Back to All Targets
              </button>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center flex-1">
              <Globe className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-xs">Click any hotspot marker or route line to inspect strategic telemetry.</p>
            </div>
          )}

          {/* Quick Target List below inspector */}
          <div className="border-t border-slate-800 p-3 max-h-48 overflow-y-auto">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-2">
              Fast Target Directory
            </span>
            <div className="space-y-1.5">
              {nodes.slice(0, 6).map((node) => (
                <button
                  key={node.id}
                  onClick={() => {
                    setSelectedNode(node);
                    setSelectedRoute(null);
                    flyToCoords(node.coordinates, 5);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                    selectedNode?.id === node.id
                      ? "bg-indigo-600 text-white font-semibold"
                      : "bg-slate-950/70 hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <span className="truncate pr-2">{node.name}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      node.status === "critical"
                        ? "bg-rose-500/30 text-rose-300"
                        : node.status === "disrupted"
                        ? "bg-amber-500/30 text-amber-300"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {node.riskScore}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Observation Hotspot Modal */}
      {isAddNodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Pin Custom Observation Hotspot</h3>
              </div>
              <button
                onClick={() => setIsAddNodeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Target / Facility Name</label>
                <input
                  type="text"
                  required
                  value={newNodeForm.name}
                  onChange={(e) => setNewNodeForm({ ...newNodeForm, name: e.target.value })}
                  placeholder="e.g., Strait of Gibraltar or Kumamoto Fab 2"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Latitude (°N/S)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newNodeForm.latitude}
                    onChange={(e) => setNewNodeForm({ ...newNodeForm, latitude: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Longitude (°E/W)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newNodeForm.longitude}
                    onChange={(e) => setNewNodeForm({ ...newNodeForm, longitude: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <select
                    value={newNodeForm.category}
                    onChange={(e) =>
                      setNewNodeForm({ ...newNodeForm, category: e.target.value as GeoIntelligenceNode["category"] })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="chokepoint">Maritime Chokepoint</option>
                    <option value="semiconductor">Semiconductor Foundry</option>
                    <option value="finance">Financial Core / Exchange</option>
                    <option value="logistics">Deepwater Mega-Port</option>
                    <option value="energy">Energy Corridor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Threat Severity</label>
                  <select
                    value={newNodeForm.status}
                    onChange={(e) =>
                      setNewNodeForm({ ...newNodeForm, status: e.target.value as GeoIntelligenceNode["status"] })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="critical">Critical (War / Blockade)</option>
                    <option value="disrupted">Disrupted (Heavy Congestion)</option>
                    <option value="elevated_risk">Elevated Risk</option>
                    <option value="nominal">Nominal / Monitored</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Throughput Value</label>
                  <input
                    type="text"
                    value={newNodeForm.dailyThroughputUSD}
                    onChange={(e) => setNewNodeForm({ ...newNodeForm, dailyThroughputUSD: e.target.value })}
                    placeholder="e.g. $4.5B / day"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Risk Index (0-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={newNodeForm.riskScore}
                    onChange={(e) => setNewNodeForm({ ...newNodeForm, riskScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Incident Advisory</label>
                <textarea
                  rows={2}
                  value={newNodeForm.currentIncident}
                  onChange={(e) => setNewNodeForm({ ...newNodeForm, currentIncident: e.target.value })}
                  placeholder="Describe active geopolitical threat, weather disruption, or regulatory block"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddNodeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Deploy Hotspot to Map
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
