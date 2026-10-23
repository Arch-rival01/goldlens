import { Contract } from '../lib/types';

export const MOCK_CONTRACTS: Contract[] = [
  {
    symbol: 'GOLDM',
    name: 'Gold Mini Futures',
    tradingUnitGrams: 100,
    quoteBaseGrams: 10,
    purity: 0.995,
    expiryWindow: 'Expiry window: 3rd–5th',
    fineGoldPerLotGrams: 99.5,
    tickSize: 1.0,
    lotValueEstimateInr: 746500,
    typicalBidAskBps: 2.2,
    description: '100 g trading unit quoted per 10 g; 995 purity. Verify each listed expiry with MCX.'
  },
  {
    symbol: 'GOLDTEN',
    name: 'Gold 10g Futures',
    tradingUnitGrams: 10,
    quoteBaseGrams: 10,
    purity: 0.999,
    expiryWindow: 'Expiry window: 27th–31st',
    fineGoldPerLotGrams: 9.99,
    tickSize: 1.0,
    lotValueEstimateInr: 74900,
    typicalBidAskBps: 4.5,
    description: '10 g trading unit quoted per 10 g; 999 purity. Available from its 2025 listing period onward.'
  },
  {
    symbol: 'GOLDGUINEA',
    name: 'Gold Guinea Futures',
    tradingUnitGrams: 8,
    quoteBaseGrams: 8,
    purity: 0.999,
    expiryWindow: 'Expiry window: 27th–31st',
    fineGoldPerLotGrams: 7.992,
    tickSize: 1.0,
    lotValueEstimateInr: 60120,
    typicalBidAskBps: 6.8,
    description: '8 g trading unit quoted per 8 g; 999 purity. Verify each listed expiry with MCX.'
  },
  {
    symbol: 'GOLDPETAL',
    name: 'Gold Petal Futures',
    tradingUnitGrams: 1,
    quoteBaseGrams: 1,
    purity: 0.999,
    expiryWindow: 'Expiry window: 27th–31st',
    fineGoldPerLotGrams: 0.999,
    tickSize: 1.0,
    lotValueEstimateInr: 7520,
    typicalBidAskBps: 12.4,
    description: '1 g trading unit quoted per 1 g; 999 purity. Verify each listed expiry with MCX.'
  }
];
