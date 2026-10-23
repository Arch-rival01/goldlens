import { TradeRecord } from '../lib/types';

export const MOCK_TRADE_HISTORY_AS_OF = '2026-10-20';

export const MOCK_TRADE_HISTORY: TradeRecord[] = [
  { id: 'DEMO-TRD-012', dateTime: '2026-10-20T10:35:00+05:30', symbol: 'GOLDM', side: 'Buy', quantityLots: 1, executionPrice: 78124, quoteBaseGrams: 10, expiryDate: '2026-12-05' },
  { id: 'DEMO-TRD-011', dateTime: '2026-09-18T14:12:00+05:30', symbol: 'GOLDPETAL', side: 'Sell', quantityLots: 8, executionPrice: 7688, quoteBaseGrams: 1, expiryDate: '2026-10-30' },
  { id: 'DEMO-TRD-010', dateTime: '2026-08-21T11:08:00+05:30', symbol: 'GOLDGUINEA', side: 'Buy', quantityLots: 2, executionPrice: 61540, quoteBaseGrams: 8, expiryDate: '2026-10-30' },
  { id: 'DEMO-TRD-009', dateTime: '2026-07-16T13:42:00+05:30', symbol: 'GOLDTEN', side: 'Sell', quantityLots: 3, executionPrice: 76410, quoteBaseGrams: 10, expiryDate: '2026-08-05' },
  { id: 'DEMO-TRD-008', dateTime: '2026-06-12T09:55:00+05:30', symbol: 'GOLDM', side: 'Sell', quantityLots: 1, executionPrice: 75280, quoteBaseGrams: 10, expiryDate: '2026-08-05' },
  { id: 'DEMO-TRD-007', dateTime: '2026-05-19T12:26:00+05:30', symbol: 'GOLDPETAL', side: 'Buy', quantityLots: 12, executionPrice: 7412, quoteBaseGrams: 1, expiryDate: '2026-06-30' },
  { id: 'DEMO-TRD-006', dateTime: '2026-04-14T15:05:00+05:30', symbol: 'GOLDTEN', side: 'Buy', quantityLots: 2, executionPrice: 73625, quoteBaseGrams: 10, expiryDate: '2026-06-05' },
  { id: 'DEMO-TRD-005', dateTime: '2026-03-11T10:18:00+05:30', symbol: 'GOLDGUINEA', side: 'Sell', quantityLots: 1, executionPrice: 58980, quoteBaseGrams: 8, expiryDate: '2026-04-30' },
  { id: 'DEMO-TRD-004', dateTime: '2026-02-17T13:31:00+05:30', symbol: 'GOLDM', side: 'Buy', quantityLots: 2, executionPrice: 72950, quoteBaseGrams: 10, expiryDate: '2026-04-05' },
  { id: 'DEMO-TRD-003', dateTime: '2026-01-22T11:47:00+05:30', symbol: 'GOLDPETAL', side: 'Buy', quantityLots: 5, executionPrice: 7118, quoteBaseGrams: 1, expiryDate: '2026-02-27' },
  { id: 'DEMO-TRD-002', dateTime: '2025-12-10T14:03:00+05:30', symbol: 'GOLDTEN', side: 'Sell', quantityLots: 1, executionPrice: 70420, quoteBaseGrams: 10, expiryDate: '2026-02-05' },
  { id: 'DEMO-TRD-001', dateTime: '2025-10-28T09:42:00+05:30', symbol: 'GOLDGUINEA', side: 'Buy', quantityLots: 1, executionPrice: 68250, quoteBaseGrams: 8, expiryDate: '2025-11-28' }
];
