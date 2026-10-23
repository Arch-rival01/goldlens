export type ContractSymbol = 'GOLDM' | 'GOLDTEN' | 'GOLDGUINEA' | 'GOLDPETAL';

export interface Contract {
  symbol: ContractSymbol;
  name: string;
  tradingUnitGrams: number;
  quoteBaseGrams: number;
  purity: number; // e.g. 0.995 or 0.999
  expiryWindow: string; // e.g. "Bi-monthly (Feb, Apr, Jun, Aug, Oct, Dec)"
  fineGoldPerLotGrams: number;
  tickSize: number;
  lotValueEstimateInr: number;
  typicalBidAskBps: number;
  description: string;
}

export interface PricePoint {
  date: string;
  symbol: ContractSymbol;
  expiryDate: string;
  settlePrice: number; // in INR per quote unit
  volume: number;
  openInterest: number;
  pricePerGram999: number; // Normalised INR per gram on 999 fine gold basis
  dailyChangePct?: number;
}

export interface TradeRecord {
  id: string;
  dateTime: string;
  symbol: ContractSymbol;
  side: 'Buy' | 'Sell';
  quantityLots: number;
  executionPrice: number;
  quoteBaseGrams: number;
  expiryDate: string;
}

export interface SpreadPoint {
  date: string;
  pair: string; // e.g. "GOLDM / GOLDPETAL"
  expiryPair: string; // e.g. "Apr-25 / Apr-25"
  residualBps: number; // basis points deviation from equilibrium
  medianBps: number;
  zScore: number;
  costBandBps: number; // bidirectional friction hurdle
  alertFired: boolean;
}

export interface CurvePoint {
  symbol: ContractSymbol;
  date: string;
  expiryDate: string;
  price: number; // Normalised INR / gram
  daysToExpiry: number;
  annualisedCarryPct: number;
}

export interface CarryDecomposition {
  date: string;
  symbol: ContractSymbol;
  levelMove: number; // INR / g
  curveShapeChange: number; // INR / g
  rollDown: number; // INR / g
  totalCarryInr: number;
}

export interface AlertGate {
  name: string;
  passed: boolean;
  value?: string;
  threshold?: string;
}

export interface Alert {
  id: string;
  pair: string;
  direction: 'Long Contract A / Short Contract B' | 'Short Contract A / Long Contract B';
  deviationBps: number;
  zScore: number;
  netEdgeBps: number;
  roundTripCostBps: number;
  liquidityScore: number; // 0 - 100
  halfLifeDays: number;
  daysToExpiry: number;
  daysToTender: number;
  stopZ: number;
  maxHoldDays: number;
  gates: AlertGate[];
  createdAt: string;
  outcome?: 'Pending' | 'Target Reached' | 'Stopped Out' | 'Expired (Tender Gate)';
  summary?: string;
}

export interface CalendarItem {
  symbol: ContractSymbol;
  contractMonth: string;
  expiryDate: string;
  listingDate: string;
  liquidStart: string;
  peakOiDate: string;
  migrationDate: string;
  tenderStart: string;
  lastTradingDate: string;
  status: 'Trading' | 'Tender Period' | 'Expired' | 'Upcoming';
}

export interface ResearchTrade {
  pair: string;
  symbolA: ContractSymbol;
  symbolB: ContractSymbol;
  expiryDate: string;
  longSymbol: ContractSymbol;
  shortSymbol: ContractSymbol;
  lotsA: number;
  lotsB: number;
  sideA: 'Long' | 'Short';
  sideB: 'Long' | 'Short';
  entryDate: string;
  exitDate: string;
  entryPriceA: number;
  entryPriceB: number;
  exitPriceA: number;
  exitPriceB: number;
  quoteBaseGramsA: number;
  quoteBaseGramsB: number;
  entryZ: number;
  exitZ: number | null;
  holdSessions: number;
  exitReason: string;
  grossPnlInr: number;
  estimatedCostsInr: number;
  netPnlInr: number;
  commonMoveProxyPnlInr: number;
  netAfterCommonMoveProxyInr: number;
  legNotionalImbalancePct: number;
}

export interface ResearchSignalGate {
  name: string;
  passed: boolean;
  detail: string;
}

export interface ResearchSignal {
  pair: string;
  symbolA: ContractSymbol;
  symbolB: ContractSymbol;
  expiryDate: string;
  asOfDate: string;
  residualBps: number;
  meanBps: number;
  zScore: number;
  sideA: 'Long' | 'Short';
  sideB: 'Long' | 'Short';
  lotsA: number;
  lotsB: number;
  expectedGrossPnlInr: number;
  estimatedCostsInr: number;
  expectedNetPnlInr: number;
  expectedNetEdgeBps: number;
  legNotionalImbalancePct: number;
  daysToExpiry: number;
  gates: ResearchSignalGate[];
}

export interface CurveSnapshot {
  symbol: ContractSymbol;
  asOfDate: string;
  nearExpiry: string;
  farExpiry: string;
  nearDaysToExpiry: number;
  farDaysToExpiry: number;
  nearPricePerGram999: number;
  farPricePerGram999: number;
  annualizedCarryPct: number;
}

export interface RollDownObservation {
  symbol: ContractSymbol;
  expiryDate: string;
  fromDate: string;
  toDate: string;
  rollDownInrPerGram999: number;
  observedMoveInrPerGram999: number;
  genuineCurveChangeInrPerGram999: number;
}

export interface ContractLifecycle {
  symbol: ContractSymbol;
  expiryDate: string;
  firstObservedDate: string;
  asOfDate: string;
  daysToExpiry: number;
  phase: string;
  newEntriesAllowed: boolean;
  latestVolumeLots: number;
  rollingMedianVolumeLots: number;
  volumeVsMedianPct: number | null;
}

export interface ResearchReport {
  coverage: {
    rows: number;
    contracts: number;
    symbols: ContractSymbol[];
    firstDate: string | null;
    lastDate: string | null;
    sessions: number;
  };
  configuration: {
    lookbackSessions: number;
    entryZ: number;
    maxHoldSessions: number;
    expiryBufferCalendarDays: number;
    roundTripCostBps: number;
    oneWayCostBps: number;
    volumeParticipationPct: number;
    maxLegNotionalImbalancePct: number;
  };
  currentSignals: ResearchSignal[];
  quietReason: string | null;
  curve: CurveSnapshot[];
  rollDown: RollDownObservation[];
  lifecycle: ContractLifecycle[];
  backtest: {
    status: 'insufficient_data' | 'ready';
    holdoutStart: string | null;
    holdoutEnd: string | null;
    trades: ResearchTrade[];
    tradeCount: number;
    grossPnlInr: number;
    estimatedCostsInr: number;
    netPnlInr: number;
    commonMoveProxyPnlInr: number;
    netAfterCommonMoveProxyInr: number;
    winRatePct: number | null;
    averageHoldSessions: number | null;
    message: string;
  };
  limitations: string[];
}

export interface BhavcopyUploadResult {
  filename: string;
  rowsLoaded: number;
  rowsRejected: number;
  rejected: { file: string; line: string; reason: string }[];
  truncatedRejections: number;
  dateValidation: string;
}

export interface DataHealth {
  lastUpdate: string;
  rowsLoaded: number;
  rejectedDates: { date: string; reason: string; symbol: string }[];
  qualityFlags: { flag: string; status: 'ok' | 'warning' | 'alert'; description: string }[];
  coveragePerContract: {
    symbol: ContractSymbol;
    tradingDays: number;
    missingQuotes: number;
    settlementIntegrity: number;
    avgDailyVolumeLakhs: number;
  }[];
}

export interface NotificationItem {
  id: string;
  type: 'alert' | 'system' | 'lifecycle' | 'health';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'user' | 'admin';
  followedPairs: string[];
  alertChannel: 'email' | 'telegram' | 'none';
  theme: 'light' | 'dark' | 'system';
  onboardingDone: boolean;
  createdAt: string;
  textSize?: 'normal' | 'large';
  quietHoursStart?: string;
  quietHoursEnd?: string;
  minNetEdgeBps?: number;
  minLiquidityScore?: number;
}

export interface OverviewData {
  contracts: Contract[];
  latestPrices: PricePoint[];
  activeAlerts: Alert[];
  quietReason: string;
  largestDeviation: {
    pair: string;
    zScore: number;
    residualBps: number;
    explanation: string;
  };
  keyMetrics: {
    alertsThisMonth: number;
    alertPrecisionPct: number;
    daysSinceLastAlert: number;
    monitoredPairs: number;
  };
  healthSummary: {
    lastUpdate: string;
    rowsLoaded: number;
    rejectedCount: number;
    status: 'Healthy' | 'Degraded';
  };
}
