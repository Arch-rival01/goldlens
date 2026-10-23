import { CurvePoint } from '../lib/types';

export const MOCK_CURVE: CurvePoint[] = [
  // GOLDM Term Structure (Bi-monthly tenors)
  { symbol: 'GOLDM', date: '2026-10-20', expiryDate: '2026-12-05', price: 7468.5, daysToExpiry: 46, annualisedCarryPct: 6.85 },
  { symbol: 'GOLDM', date: '2026-10-20', expiryDate: '2027-02-05', price: 7532.0, daysToExpiry: 108, annualisedCarryPct: 7.12 },
  { symbol: 'GOLDM', date: '2026-10-20', expiryDate: '2027-04-05', price: 7598.0, daysToExpiry: 167, annualisedCarryPct: 7.04 },
  { symbol: 'GOLDM', date: '2026-10-20', expiryDate: '2027-06-05', price: 7665.5, daysToExpiry: 228, annualisedCarryPct: 6.98 },

  // GOLDTEN Term Structure (Monthly tenors)
  { symbol: 'GOLDTEN', date: '2026-10-20', expiryDate: '2026-11-05', price: 7472.0, daysToExpiry: 16, annualisedCarryPct: 6.45 },
  { symbol: 'GOLDTEN', date: '2026-10-20', expiryDate: '2026-12-05', price: 7498.0, daysToExpiry: 46, annualisedCarryPct: 6.95 },
  { symbol: 'GOLDTEN', date: '2026-10-20', expiryDate: '2027-01-05', price: 7534.5, daysToExpiry: 77, annualisedCarryPct: 7.02 },

  // GOLDGUINEA Term Structure
  { symbol: 'GOLDGUINEA', date: '2026-10-20', expiryDate: '2026-10-31', price: 7481.5, daysToExpiry: 11, annualisedCarryPct: 7.20 },
  { symbol: 'GOLDGUINEA', date: '2026-10-20', expiryDate: '2026-11-30', price: 7516.0, daysToExpiry: 41, annualisedCarryPct: 7.15 },
  { symbol: 'GOLDGUINEA', date: '2026-10-20', expiryDate: '2026-12-31', price: 7552.0, daysToExpiry: 72, annualisedCarryPct: 7.10 },

  // GOLDPETAL Term Structure
  { symbol: 'GOLDPETAL', date: '2026-10-20', expiryDate: '2026-10-31', price: 7496.0, daysToExpiry: 11, annualisedCarryPct: 7.65 },
  { symbol: 'GOLDPETAL', date: '2026-10-20', expiryDate: '2026-11-30', price: 7538.5, daysToExpiry: 41, annualisedCarryPct: 7.55 },
  { symbol: 'GOLDPETAL', date: '2026-10-20', expiryDate: '2026-12-31', price: 7580.0, daysToExpiry: 72, annualisedCarryPct: 7.42 }
];
