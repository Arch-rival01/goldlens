import { DataHealth } from '../lib/types';

export const MOCK_DATA_HEALTH: DataHealth = {
  lastUpdate: 'Illustrative sample timestamp (no exchange connection)',
  rowsLoaded: 480,
  rejectedDates: [
    { date: '2026-08-15', reason: 'Example non-trading date; not verified against the MCX calendar', symbol: 'ALL' },
    { date: '2026-10-02', reason: 'Example non-trading date; not verified against the MCX calendar', symbol: 'ALL' },
    { date: '2026-09-07', reason: 'Example invalid-row filter; no tick feed is connected', symbol: 'GOLDPETAL' }
  ],
  qualityFlags: [
    { flag: 'Purity Equivalence Constant', status: 'ok', description: '995-to-999 conversion multiplier mathematically verified (999/995 = 1.00402)' },
    { flag: 'Cross-Contract Timestamp Continuity', status: 'ok', description: 'Planned check for timestamp differences between contract samples' },
    { flag: 'Tender Period Filter Engine', status: 'ok', description: 'Proposed 5-session pre-tender exclusion; not evaluated against live contract dates' },
    { flag: 'STT & Exchange Fee Tables', status: 'ok', description: 'Example fee parameters only; verify current exchange and statutory charges before use' },
    { flag: 'Microstructure Bid-Ask Slippage Penalty', status: 'ok', description: 'Planned slippage check; no live order-book depth is connected' }
  ],
  coveragePerContract: [
    { symbol: 'GOLDM', tradingDays: 120, missingQuotes: 0, settlementIntegrity: 100.0, avgDailyVolumeLakhs: 1420.5 },
    { symbol: 'GOLDTEN', tradingDays: 120, missingQuotes: 0, settlementIntegrity: 100.0, avgDailyVolumeLakhs: 412.0 },
    { symbol: 'GOLDGUINEA', tradingDays: 120, missingQuotes: 0, settlementIntegrity: 100.0, avgDailyVolumeLakhs: 118.4 },
    { symbol: 'GOLDPETAL', tradingDays: 120, missingQuotes: 0, settlementIntegrity: 100.0, avgDailyVolumeLakhs: 365.8 }
  ]
};
