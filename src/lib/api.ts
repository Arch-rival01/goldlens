import {
  Contract,
  PricePoint,
  SpreadPoint,
  CurvePoint,
  CarryDecomposition,
  Alert,
  CalendarItem,
  ResearchReport,
  BhavcopyUploadResult,
  DataHealth,
  NotificationItem,
  OverviewData,
  TradeRecord
} from './types';

import { MOCK_CONTRACTS } from '../mock/contracts';
import { MOCK_PRICES, getLatestPriceForSymbol } from '../mock/prices';
import { MOCK_SPREADS } from '../mock/spreads';
import { MOCK_CURVE } from '../mock/curve';
import { MOCK_CARRY } from '../mock/carry';
import { MOCK_CALENDAR } from '../mock/calendar';
import { MOCK_ACTIVE_ALERTS, MOCK_HISTORICAL_ALERTS } from '../mock/alerts';
import { MOCK_DATA_HEALTH } from '../mock/health';
import { MOCK_NOTIFICATIONS } from '../mock/notifications';
import { MOCK_TRADE_HISTORY, MOCK_TRADE_HISTORY_AS_OF } from '../mock/trades';

// Toggle constant to allow easy switching to a real backend API in the future
export const USE_MOCK = true;
const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

async function readApiError(response: Response): Promise<Error> {
  try {
    const payload = await response.json() as { detail?: string };
    return new Error(payload.detail || `API request failed (${response.status})`);
  } catch {
    return new Error(`API request failed (${response.status})`);
  }
}

// Helper to simulate slight network latency for authentic skeleton UX
function delay(ms: number = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getOverview(): Promise<OverviewData> {
  if (USE_MOCK) {
    await delay(200);
    const latestPrices = [
      getLatestPriceForSymbol('GOLDM'),
      getLatestPriceForSymbol('GOLDTEN'),
      getLatestPriceForSymbol('GOLDGUINEA'),
      getLatestPriceForSymbol('GOLDPETAL')
    ];

    return {
      contracts: MOCK_CONTRACTS,
      latestPrices,
      activeAlerts: MOCK_ACTIVE_ALERTS, // Quiet state by default
      quietReason: 'Largest deviation is 0.8 sigma on GOLDM / GOLDPETAL; expected gross edge of 3.2 bps is below total execution friction hurdle (11.4 bps).',
      largestDeviation: {
        pair: 'GOLDM / GOLDPETAL',
        zScore: 0.82,
        residualBps: 3.2,
        explanation: 'Friction hurdle is 11.4 bps. Signal suppressed by Gate 1 (Cost Hurdle Gate).'
      },
      keyMetrics: {
        alertsThisMonth: 1,
        alertPrecisionPct: 100, // 100% of signals that cleared all 5 gates reached target
        daysSinceLastAlert: 12,
        monitoredPairs: 6
      },
      healthSummary: {
        lastUpdate: MOCK_DATA_HEALTH.lastUpdate,
        rowsLoaded: MOCK_DATA_HEALTH.rowsLoaded,
        rejectedCount: MOCK_DATA_HEALTH.rejectedDates.length,
        status: 'Healthy'
      }
    };
  }
  throw new Error('Real API endpoint not configured');
}

export async function getContracts(): Promise<Contract[]> {
  if (USE_MOCK) {
    await delay(180);
    return [...MOCK_CONTRACTS];
  }
  throw new Error('Real API endpoint not configured');
}

export async function getPrices(): Promise<PricePoint[]> {
  if (USE_MOCK) {
    await delay(250);
    return [...MOCK_PRICES];
  }
  throw new Error('Real API endpoint not configured');
}

export async function getSpreads(pair?: string): Promise<SpreadPoint[]> {
  if (USE_MOCK) {
    await delay(220);
    if (pair) {
      return MOCK_SPREADS.filter((s) => s.pair === pair);
    }
    return [...MOCK_SPREADS];
  }
  throw new Error('Real API endpoint not configured');
}

export async function getCurve(): Promise<CurvePoint[]> {
  if (USE_MOCK) {
    await delay(180);
    return [...MOCK_CURVE];
  }
  throw new Error('Real API endpoint not configured');
}

export async function getCarry(): Promise<CarryDecomposition[]> {
  if (USE_MOCK) {
    await delay(200);
    return [...MOCK_CARRY];
  }
  throw new Error('Real API endpoint not configured');
}

export async function getCalendar(): Promise<CalendarItem[]> {
  if (USE_MOCK) {
    await delay(180);
    return [...MOCK_CALENDAR];
  }
  throw new Error('Real API endpoint not configured');
}

export async function getResearch(roundTripCostBps: number): Promise<ResearchReport> {
  const response = await fetch(
    `${API_BASE}/research?round_trip_cost_bps=${encodeURIComponent(roundTripCostBps)}`
  );
  if (!response.ok) throw await readApiError(response);
  return response.json() as Promise<ResearchReport>;
}

export async function uploadBhavcopy(file: File, requestedDate?: string): Promise<BhavcopyUploadResult> {
  const query = requestedDate
    ? `?requested_date=${encodeURIComponent(requestedDate)}`
    : '';
  const response = await fetch(`${API_BASE}/bhavcopy${query}`, {
    method: 'POST',
    headers: { 'X-Filename': file.name },
    body: file
  });
  if (!response.ok) throw await readApiError(response);
  return response.json() as Promise<BhavcopyUploadResult>;
}

export async function getAlerts(): Promise<{ active: Alert[]; historical: Alert[] }> {
  if (USE_MOCK) {
    await delay(200);
    return {
      active: [...MOCK_ACTIVE_ALERTS],
      historical: [...MOCK_HISTORICAL_ALERTS]
    };
  }
  throw new Error('Real API endpoint not configured');
}

export async function getHealth(): Promise<DataHealth> {
  if (USE_MOCK) {
    await delay(180);
    return { ...MOCK_DATA_HEALTH };
  }
  throw new Error('Real API endpoint not configured');
}

export async function getNotifications(): Promise<NotificationItem[]> {
  if (USE_MOCK) {
    await delay(150);
    return [...MOCK_NOTIFICATIONS];
  }
  throw new Error('Real API endpoint not configured');
}

export async function getTradeHistory(): Promise<{ asOfDate: string; trades: TradeRecord[] }> {
  if (USE_MOCK) {
    await delay(180);
    return {
      asOfDate: MOCK_TRADE_HISTORY_AS_OF,
      trades: [...MOCK_TRADE_HISTORY]
    };
  }
  throw new Error('Real trade history API endpoint not configured');
}
