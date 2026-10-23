import { Alert } from '../lib/types';

export const MOCK_ACTIVE_ALERTS: Alert[] = []; // Default is calm/quiet as requested!

export const MOCK_SAMPLE_ACTIVE_ALERT: Alert = {
  id: 'ALT-2026-1020-01',
  pair: 'GOLDM / GOLDPETAL',
  direction: 'Long Contract A / Short Contract B',
  deviationBps: 18.2,
  zScore: 2.65,
  netEdgeBps: 6.8,
  roundTripCostBps: 11.4,
  liquidityScore: 82,
  halfLifeDays: 4.8,
  daysToExpiry: 46,
  daysToTender: 38,
  stopZ: 3.4,
  maxHoldDays: 10,
  createdAt: '2026-10-20T08:30:00Z',
  outcome: 'Pending',
  summary: 'GOLDPETAL retail premium spiked 18.2 bps vs GOLDM institutional benchmark. Expected net edge after 11.4 bps round-trip friction is +6.8 bps.',
  gates: [
    { name: 'Cost Hurdle Gate', passed: true, value: '+6.8 bps net', threshold: '> 3.0 bps net' },
    { name: 'Bid-Ask Spread Feasibility', passed: true, value: '3.8 bps total', threshold: '< 8.0 bps' },
    { name: 'Liquidity Score', passed: true, value: '82 / 100', threshold: '>= 60' },
    { name: 'Tender Period Clearance', passed: true, value: '38 days to tender', threshold: '> 5 days' },
    { name: 'Half-Life Decay Bound', passed: true, value: '4.8 days', threshold: '< 14 days' },
    { name: 'Holdout Horizon', passed: true, value: '10 days limit', threshold: '<= 15 days' }
  ]
};

export const MOCK_HISTORICAL_ALERTS: Alert[] = [
  {
    id: 'ALT-2026-1008-01',
    pair: 'GOLDM / GOLDTEN',
    direction: 'Short Contract A / Long Contract B',
    deviationBps: 7.4,
    zScore: 2.32,
    netEdgeBps: 3.6,
    roundTripCostBps: 3.8,
    liquidityScore: 94,
    halfLifeDays: 3.2,
    daysToExpiry: 58,
    daysToTender: 50,
    stopZ: 3.2,
    maxHoldDays: 8,
    createdAt: '2026-10-08T09:15:00Z',
    outcome: 'Target Reached',
    summary: 'GOLDTEN lagged GOLDM morning bounce. Reverted to mean within 4 trading sessions with +3.2 bps net captured.',
    gates: [
      { name: 'Cost Hurdle Gate', passed: true, value: '+3.6 bps', threshold: '> 2.0 bps' },
      { name: 'Bid-Ask Spread Feasibility', passed: true, value: '2.1 bps', threshold: '< 4.5 bps' },
      { name: 'Liquidity Score', passed: true, value: '94 / 100', threshold: '>= 60' },
      { name: 'Tender Period Clearance', passed: true, value: '50 days', threshold: '> 5 days' }
    ]
  },
  {
    id: 'ALT-2026-0924-02',
    pair: 'GOLDTEN / GOLDGUINEA',
    direction: 'Long Contract A / Short Contract B',
    deviationBps: 12.1,
    zScore: 2.48,
    netEdgeBps: 6.7,
    roundTripCostBps: 5.4,
    liquidityScore: 78,
    halfLifeDays: 5.4,
    daysToExpiry: 36,
    daysToTender: 28,
    stopZ: 3.3,
    maxHoldDays: 12,
    createdAt: '2026-09-24T11:45:00Z',
    outcome: 'Target Reached',
    summary: 'Festival buying surge in GOLDGUINEA compressed spread against GOLDTEN. Clean mean reversion achieved in 6 days.',
    gates: [
      { name: 'Cost Hurdle Gate', passed: true, value: '+6.7 bps', threshold: '> 3.0 bps' },
      { name: 'Bid-Ask Spread Feasibility', passed: true, value: '3.9 bps', threshold: '< 6.0 bps' },
      { name: 'Liquidity Score', passed: true, value: '78 / 100', threshold: '>= 60' },
      { name: 'Tender Period Clearance', passed: true, value: '28 days', threshold: '> 5 days' }
    ]
  },
  {
    id: 'ALT-2026-0818-01',
    pair: 'GOLDM / GOLDPETAL',
    direction: 'Long Contract A / Short Contract B',
    deviationBps: 16.5,
    zScore: 2.55,
    netEdgeBps: 5.1,
    roundTripCostBps: 11.4,
    liquidityScore: 84,
    halfLifeDays: 6.1,
    daysToExpiry: 44,
    daysToTender: 36,
    stopZ: 3.5,
    maxHoldDays: 12,
    createdAt: '2026-08-18T14:10:00Z',
    outcome: 'Target Reached',
    summary: 'Extreme discount on GOLDM vs retail GOLDPETAL. Converged smoothly as institutional desks rebalanced.',
    gates: [
      { name: 'Cost Hurdle Gate', passed: true, value: '+5.1 bps', threshold: '> 3.0 bps' },
      { name: 'Bid-Ask Spread Feasibility', passed: true, value: '4.2 bps', threshold: '< 8.0 bps' },
      { name: 'Liquidity Score', passed: true, value: '84 / 100', threshold: '>= 60' },
      { name: 'Tender Period Clearance', passed: true, value: '36 days', threshold: '> 5 days' }
    ]
  }
];
