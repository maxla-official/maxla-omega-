import { AuthorityAlert } from "../types";

export const INITIAL_AUTHORITY_ALERTS: AuthorityAlert[] = [
  {
    id: "SEMI-IND-01",
    timestamp: "1 min ago",
    title: "SEMICON India Corridor: Bengaluru Design & Sanand ATMP Lead-Time Correlation Risk",
    severity: "critical",
    source: "SEMICON India Supply Chain Correlation Engine",
    description:
      "Telemetry correlation detected: Bengaluru 3nm EDA tape-out variance (Risk 64%) is directly propagating to Sanand ATMP substrate bottleneck (Risk 88%) with 18-day delay. Mysuru compound semiconductor fab (Risk 71%) requires gas purification buffer.",
    recommendedAction:
      "Dual Approval Workflow: Authorize $18.5M Japanese ABF substrate air-bridge charter and calibrate tapeout signoff gate.",
    requiresDualKey: true,
    status: "active",
  },
  {
    id: "AUTH-8921",
    timestamp: "6 mins ago",
    title: "Autonomous Capital Hedge & Currency Exposure Rebalancing",
    severity: "critical",
    source: "Auto-Intelligence Sentinel Engine (Cross-Asset Macro)",
    description:
      "Automated monitoring detected simultaneous 28 bps spread widening in US10Y sovereign yields and FX volatility. AI algorithms generated an automated $185M forward hedging allocation.",
    recommendedAction:
      "Dual Approval Workflow: Executive sign-off required to authorize transaction execution and treasury release.",
    requiresDualKey: true,
    status: "active",
  },
  {
    id: "AUTH-8922",
    timestamp: "14 mins ago",
    title: "Critical Dual-Sourcing Semiconductor Supply Chain Gate",
    severity: "high",
    source: "MECE Operational Sentinel (Tier-1 Silicon Supply)",
    description:
      "Automated risk scoring identified single-point-of-failure threshold exceeded (82% concentration risk). AI synthesized an immediate transition of 30% wafer fabrication to secondary foundries.",
    recommendedAction:
      "Executive review of supply terms and Capex reallocation threshold of $42M.",
    requiresDualKey: false,
    status: "active",
  },
  {
    id: "AUTH-8923",
    timestamp: "28 mins ago",
    title: "Autonomous Red-Team Containment Protocol for Cloud Tenancy",
    severity: "warning",
    source: "DeepTech AI Guardrail Engine",
    description:
      "AI detected anomalous outbound inference latency and unauthorized vector embedding queries across Frankfurt and Singapore data zones. Autonomous isolation recommended.",
    recommendedAction:
      "Confirm emergency revocation of compromised enterprise API keys and network enclave isolation.",
    requiresDualKey: false,
    status: "active",
  },
];
