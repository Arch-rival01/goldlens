import { CarryDecomposition } from '../lib/types';
import { getPastDates, mulberry32 } from './prng';

const recentDates = getPastDates(20);

export function generateMockCarry(): CarryDecomposition[] {
  const prng = mulberry32(491823);
  const items: CarryDecomposition[] = [];

  for (const date of recentDates) {
    const symbols = ['GOLDM', 'GOLDTEN', 'GOLDGUINEA', 'GOLDPETAL'] as const;
    for (const symbol of symbols) {
      const levelMove = Math.round((prng() - 0.49) * 28 * 10) / 10;
      const curveShapeChange = Math.round((prng() - 0.5) * 4.5 * 10) / 10;
      const rollDown = Math.round((0.8 + prng() * 1.4) * 10) / 10; // positive roll-down in contango curve
      const totalCarry = Math.round((levelMove + curveShapeChange + rollDown) * 10) / 10;

      items.push({
        date,
        symbol,
        levelMove,
        curveShapeChange,
        rollDown,
        totalCarryInr: totalCarry
      });
    }
  }

  return items;
}

export const MOCK_CARRY = generateMockCarry();
