export type FloorId = 0 | 1 | 2 | 3 | 4;

export type AppTab = 'command' | 'boardroom' | 'archive' | 'performance' | 'terminal' | 'intelligence';

export type ThemeMode = 'light' | 'dark';
export type TimeOfDay = 'day' | 'sunset' | 'night';

export type FirmStatusType = 
  | 'PRE_MARKET_INGESTION' 
  | 'ACTIVE_SHIFT' 
  | 'POST_MARKET_REVIEW' 
  | 'STANDBY_MODE';

export interface StockTicker {
  symbol: string;
  name: string;
  label?: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: string;
  sparkline: number[];
}

export interface AgentMetric {
  hoursBilledToday: string;
  totalHours: string;
  tokensProcessed: string;
  accuracyScore: string;
  status: 'Optimal' | 'Auditing' | 'Debating' | 'Streaming' | 'Standby';
  engine: string;
  tenure: string;
  department: string;
  history: string;
  activeTool?: string;
}

export interface Agent {
  id: string;
  name: string;
  title: string;
  role: string;
  floorId: FloorId;
  avatarSeed: string;
  status: 'Active' | 'Deliberating' | 'Computing' | 'Warning' | 'Idle';
  currentState: string;
  currentTask: string;
  activeTool: string;
  efficiency: string;
  model: string;
  metrics: AgentMetric;
}

export interface DebateMessage {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerRole: string;
  floorId: FloorId;
  timestamp: string;
  message: string;
  voteStance?: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'DISSENT';
}

export interface FloorData {
  id: FloorId;
  name: string;
  shortCode: string;
  department: string;
  role: string;
  status: 'IN_SESSION' | 'AUDITING' | 'PARSING' | 'SCANNING' | 'TRANSMITTING';
  accentColor: string;
  glowColor: string;
  borderClass: string;
  agents: Agent[];
  activeTasks: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  debateLogs: DebateMessage[];
}

export interface BoardDecision {
  id: string;
  date: string;
  meetingTitle: string;
  decision: 'APPROVED_INCREMENTAL_BUY' | 'REDUCED_LEVERAGE_CEILING' | 'MANDATORY_HEDGE_ORDER' | 'SECTOR_REALLOCATION_RATIFIED';
  status: 'EXECUTED' | 'RECORDED' | 'RATIFIED';
  votes: {
    yea: number;
    nay: number;
    abstain: number;
  };
  summary: string;
  markdownTranscript: string;
  participants: string[];
  affectedCapital: string;
  riskRating: 'LOW' | 'MEDIUM' | 'ELEVATED' | 'HIGH';
}

export interface TelemetryPacket {
  id: string;
  fromFloor: FloorId;
  toFloor: FloorId;
  progress: number;
  speed: number;
  type: 'TICK_ANOMALY' | 'SEC_XBRL_PARSED' | 'VAR_CALCULATION' | 'BOARD_DIRECTIVE' | 'PORTFOLIO_HEDGE';
  payloadSummary: string;
  timestamp: string;
}

export interface EventLogEntry {
  id: string;
  timestamp: string;
  floorId: FloorId;
  agentName: string;
  type: 'INFO' | 'QUANT_SIGNAL' | 'RISK_FLAG' | 'BOARD_DIRECTIVE' | 'SEC_XBRL' | 'STATE_BUS';
  message: string;
  rawJson?: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: 'SEC EDGAR' | 'BLOOMBERG TERMINAL' | 'FEDERAL RESERVE' | 'CFTC' | 'REUTERS';
  category: 'SEC_FILING' | 'MACRO_RATES' | 'QUANT_ALPHA' | 'SYSTEMIC_RISK';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'ALERT';
  timestamp: string;
  ticker?: string;
  impactScore: number;
  summary: string;
  secFilingType?: '8-K' | '10-Q' | '10-K' | '13-F' | 'FOMC_MINUTES';
}

export interface HumanIntervention {
  id: string;
  timestamp: string;
  commander: string;
  action: 'VETO_HALT' | 'DELTA_HEDGE' | 'LIQUIDITY_BUFFER' | 'CUSTOM_DIRECTIVE';
  commandText: string;
  previousState: string;
  adjustedWeights: {
    quantDeskWeight: number;
    riskWeight: number;
    fundamentalWeight: number;
  };
  status: 'ACTIVE_INTERVENTION' | 'RE_ROUTING_LANGGRAPH' | 'RESOLVED_CONSENSUS';
  systemResponse: string;
}
