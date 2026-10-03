/**
 * Maxla Strategic Intelligence Platform - Core Types
 */

export type ProblemDomain =
  | "Corporate Strategy"
  | "Global Supply Chain"
  | "FinTech & Capital Markets"
  | "DeepTech & Cloud Infrastructure"
  | "Geopolitics & Trade Compliance"
  | "Crisis & Incident Escalation"
  | "Operational Restructuring";

export type ProblemScope =
  | "Global Enterprise"
  | "Multinational Business Unit"
  | "High-Growth Scaleup"
  | "Critical Infrastructure Provider";

export type UrgencyLevel = "Critical (Immediate Triage)" | "High (90-Day Sprint)" | "Medium (Strategic Horizon)";

export interface ProblemInput {
  id?: string;
  title: string;
  domain: ProblemDomain;
  scope: ProblemScope;
  urgency: UrgencyLevel;
  context: string;
  constraints: string[];
}

export interface RootCauseItem {
  category: string;
  cause: string;
  evidenceImpact: string;
}

export interface ProblemDeconstruction {
  primarySymptoms: string[];
  underlyingRootCauses: RootCauseItem[];
}

export interface MecePillar {
  pillarName: string;
  hypothesis: string;
  keyQuestions: string[];
  leveragePoints: string;
}

export interface StrategicOption {
  id: string;
  name: string;
  type: string;
  description: string;
  feasibilityScore: number; // 1 - 10
  impactScore: number; // 1 - 10
  timeToValueWeeks: number;
  estimatedCapex: string;
  pros: string[];
  cons: string[];
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
}

export interface RecommendedStrategy {
  selectedOptionId: string;
  recommendationRationale: string;
  decisiveDifferentiators: string[];
  unintendedConsequencesMitigation: string;
}

export interface WorkstreamAction {
  stream: string;
  actionItem: string;
  deliverable: string;
  ownerRole: string;
  status?: "pending" | "in_progress" | "completed" | "blocked";
}

export interface ExecutionPhase {
  phaseNumber: number;
  phaseName: string;
  duration: string;
  objective: string;
  workstreams: WorkstreamAction[];
  exitGateCondition: string;
}

export interface RiskItem {
  riskTitle: string;
  probabilityScore: number; // 1 - 5
  impactScore: number; // 1 - 5
  mitigationProtocol: string;
  contingencyTrigger: string;
}

export interface TargetKpi {
  metric: string;
  baseline: string;
  target: string;
  timeframe: string;
  currentProgress?: number; // 0 - 100%
}

export interface AnalysisResult {
  executiveSummary: string;
  problemDeconstruction: ProblemDeconstruction;
  mecePillars: MecePillar[];
  strategicOptions: StrategicOption[];
  recommendedStrategy: RecommendedStrategy;
  executionRoadmap: ExecutionPhase[];
  riskHeatmap: RiskItem[];
  targetKpis: TargetKpi[];
}

export interface DecisionWeights {
  impact: number;
  feasibility: number;
  speed: number;
  costEfficiency: number;
  riskTolerance: number;
}

export interface CaseStudy {
  id: string;
  title: string;
  domain: ProblemDomain;
  scope: ProblemScope;
  urgency: UrgencyLevel;
  tagline: string;
  context: string;
  constraints: string[];
  data: AnalysisResult;
}

export type AssetCategory =
  | "all"
  | "indices"
  | "equities"
  | "commodities"
  | "rates"
  | "crypto"
  | "fx";

export interface TickerAsset {
  symbol: string;
  name: string;
  category: "indices" | "equities" | "commodities" | "rates" | "crypto" | "fx";
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  high24h: number;
  low24h: number;
  volume: string;
  currency: string;
  unit?: string;
  history: number[];
  sparkline: number[];
  lastUpdate: number;
  tickDirection?: "up" | "down" | "flat";
  marketCap?: string;
  peRatio?: string;
  dividendYield?: string;
  executiveInsight?: string;
}

export type AuthorityAlertLevel =
  | "CONTINUITY PROTOCOL | TIER-1 RISK MAP"
  | "TIER-1 (Critical Override Required)"
  | "TIER-2 (Executive Sign-Off Pending)"
  | "TIER-3 (Autonomous Guardrails Active)"
  | "DEFCON-1 (Critical Override Required)"
  | "DEFCON-2 (Executive Sign-Off Pending)"
  | "DEFCON-3 (Autonomous Guardrails Active)";

export interface AuthorityAlert {
  id: string;
  timestamp: string;
  title: string;
  severity: "critical" | "high" | "warning";
  source: string;
  description: string;
  recommendedAction: string;
  requiresDualKey: boolean;
  status: "active" | "authorized" | "overridden" | "dismissed";
  authorizedBy?: string;
  authorizedAt?: string;
  overrideNotes?: string;
}

export interface HumanAuthorityState {
  isAlertModeActive: boolean;
  authorityLevel: AuthorityAlertLevel;
  humanSignOffRequired: boolean;
  activeOfficer: string;
  officerRole: string;
  alerts: AuthorityAlert[];
}

export interface ApprovalLogEntry {
  id: string;
  timestamp: string;
  isoDate: string;
  actionType:
    | "ai_directive_authorization"
    | "manual_override"
    | "strategy_promotion"
    | "threshold_calibration"
    | "dual_key_signoff"
    | "kpi_target_commit"
    | "black_swan_escalation";
  title: string;
  description: string;
  officerName: string;
  officerRole: string;
  authorityLevel: AuthorityAlertLevel;
  severity: "critical" | "high" | "warning" | "info";
  status: "approved" | "overridden" | "pending" | "rejected";
  capexImpact?: string;
  cryptographicSignature: string;
  sourceModule: string;
  notes?: string;
}
