import { PricePoint, ContractSymbol } from '../lib/types';
import { mulberry32, getPastDates } from './prng';

// Generate ~120 trading days of historical data using a fixed seed (42)
const dates = getPastDates(120);

export function generateMockPrices(): PricePoint[] {
  const prng = mulberry32(1048576);
  const points: PricePoint[] = [];

  // Base price around ₹7,320 per gram 999 equivalent at start of 120-day window
  let baseGold = 7320.0;

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    // Daily gold price return with realistic gold volatility ~0.65% daily
    const dailyShock = (prng() - 0.485) * 0.013;
    baseGold = Math.round((baseGold * (1 + dailyShock)) * 100) / 100;

    // Normalised premiums per contract (microstructure differences)
    // GOLDM: benchmark institutional liquid pricing
    const mNorm = baseGold + (prng() - 0.5) * 1.5;
    // GOLDTEN: tiny premium (+0.80 INR/g avg)
    const tenNorm = baseGold + 0.8 + (prng() - 0.5) * 2.2;
    // GOLDGUINEA: retail jewellery premium (+2.40 INR/g avg)
    const guineaNorm = baseGold + 2.4 + (prng() - 0.5) * 3.4;
    // GOLDPETAL: retail micro structural premium (+5.80 INR/g avg)
    const petalNorm = baseGold + 5.8 + (prng() - 0.45) * 4.6;

    // Convert normalised 999 INR/g back into contract quote unit settle price
    // GOLDM: 10g quote base, 995 purity -> settle = norm * 10 * (995 / 999)
    const mSettle = Math.round(mNorm * 10 * (995 / 999));
    const tenSettle = Math.round(tenNorm * 10);
    const guineaSettle = Math.round(guineaNorm * 8);
    const petalSettle = Math.round(petalNorm);

    // Volumes & Open Interest
    const mVol = Math.floor(18000 + prng() * 12000);
    const mOi = Math.floor(28000 + (i * 45) + prng() * 1000);

    const tenVol = Math.floor(4200 + prng() * 2500);
    const tenOi = Math.floor(8500 + (i * 20) + prng() * 500);

    const guineaVol = Math.floor(1900 + prng() * 1400);
    const guineaOi = Math.floor(4100 + (i * 12) + prng() * 300);

    const petalVol = Math.floor(7500 + prng() * 4500);
    const petalOi = Math.floor(14200 + (i * 35) + prng() * 800);

    // Calculate daily changes if i > 0
    points.push({
      date,
      symbol: 'GOLDM',
      expiryDate: '2026-12-05',
      settlePrice: mSettle,
      volume: mVol,
      openInterest: mOi,
      pricePerGram999: Math.round(mNorm * 100) / 100
    });

    points.push({
      date,
      symbol: 'GOLDTEN',
      expiryDate: '2026-11-05',
      settlePrice: tenSettle,
      volume: tenVol,
      openInterest: tenOi,
      pricePerGram999: Math.round(tenNorm * 100) / 100
    });

    points.push({
      date,
      symbol: 'GOLDGUINEA',
      expiryDate: '2026-10-31',
      settlePrice: guineaSettle,
      volume: guineaVol,
      openInterest: guineaOi,
      pricePerGram999: Math.round(guineaNorm * 100) / 100
    });

    points.push({
      date,
      symbol: 'GOLDPETAL',
      expiryDate: '2026-10-31',
      settlePrice: petalSettle,
      volume: petalVol,
      openInterest: petalOi,
      pricePerGram999: Math.round(petalNorm * 100) / 100
    });
  }

  return points;
}

export const MOCK_PRICES = generateMockPrices();

export function getLatestPriceForSymbol(symbol: ContractSymbol): PricePoint {
  const symbolPrices = MOCK_PRICES.filter(p => p.symbol === symbol);
  const latest = symbolPrices[symbolPrices.length - 1];
  const prev = symbolPrices[symbolPrices.length - 2];
  const changePct = prev
    ? Math.round(((latest.pricePerGram999 - prev.pricePerGram999) / prev.pricePerGram999) * 10000) / 100
    : 0;
  return {
    ...latest,
    dailyChangePct: changePct
  };
}
