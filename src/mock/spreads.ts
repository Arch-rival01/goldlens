import { SpreadPoint } from '../lib/types';
import { mulberry32, getPastDates } from './prng';

const dates = getPastDates(120);

export const MOCK_PAIRS = [
  'GOLDM / GOLDPETAL',
  'GOLDM / GOLDTEN',
  'GOLDTEN / GOLDGUINEA',
  'GOLDGUINEA / GOLDPETAL',
  'GOLDM / GOLDGUINEA',
  'GOLDTEN / GOLDPETAL'
];

export function generateMockSpreads(): SpreadPoint[] {
  const prng = mulberry32(839217);
  const spreads: SpreadPoint[] = [];

  const pairConfigs = [
    {
      pair: 'GOLDM / GOLDPETAL',
      expiryPair: 'Dec-26 / Oct-26',
      medianBps: 8.4,
      costBandBps: 11.2,
      baseVolBps: 2.1,
      alertDays: [42, 94]
    },
    {
      pair: 'GOLDM / GOLDTEN',
      expiryPair: 'Dec-26 / Nov-26',
      medianBps: 1.8,
      costBandBps: 3.8,
      baseVolBps: 1.1,
      alertDays: [78]
    },
    {
      pair: 'GOLDTEN / GOLDGUINEA',
      expiryPair: 'Nov-26 / Oct-26',
      medianBps: 2.6,
      costBandBps: 5.4,
      baseVolBps: 1.4,
      alertDays: [111]
    },
    {
      pair: 'GOLDGUINEA / GOLDPETAL',
      expiryPair: 'Oct-26 / Oct-26',
      medianBps: 4.8,
      costBandBps: 9.6,
      baseVolBps: 1.9,
      alertDays: []
    },
    {
      pair: 'GOLDM / GOLDGUINEA',
      expiryPair: 'Dec-26 / Oct-26',
      medianBps: 3.9,
      costBandBps: 6.2,
      baseVolBps: 1.5,
      alertDays: [95]
    },
    {
      pair: 'GOLDTEN / GOLDPETAL',
      expiryPair: 'Oct-26 / Oct-26',
      medianBps: 1.7,
      costBandBps: 8.8,
      baseVolBps: 1.8,
      alertDays: []
    }
  ];

  for (const config of pairConfigs) {
    for (let i = 0; i < dates.length; i++) {
      const isAlertDay = config.alertDays.includes(i);
      let residual: number;
      let zScore: number;

      if (isAlertDay) {
        // High excursion day exceeding cost hurdle and triggering alert
        const directionSign = i % 2 === 0 ? 1 : -1;
        residual = config.medianBps + directionSign * (config.costBandBps + 6.5 + prng() * 2.0);
        zScore = directionSign * (2.45 + prng() * 0.4);
      } else {
        // Normal quiet days with mean-reverting noise (low z-score, within cost band)
        const shock = (prng() - 0.5) * 2 * config.baseVolBps;
        residual = config.medianBps + shock;
        zScore = Math.round(((residual - config.medianBps) / config.baseVolBps) * 100) / 100;
        // Clamp z-score on quiet days below 1.4
        if (Math.abs(zScore) > 1.4) {
          zScore = (zScore > 0 ? 1 : -1) * (0.6 + prng() * 0.6);
          residual = config.medianBps + zScore * config.baseVolBps;
        }
      }

      spreads.push({
        date: dates[i],
        pair: config.pair,
        expiryPair: config.expiryPair,
        residualBps: Math.round(residual * 10) / 10,
        medianBps: config.medianBps,
        zScore: Math.round(zScore * 100) / 100,
        costBandBps: config.costBandBps,
        alertFired: isAlertDay
      });
    }
  }

  return spreads;
}

export const MOCK_SPREADS = generateMockSpreads();
