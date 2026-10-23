// Deterministic pseudo-random number generator (Mulberry32) for reproducible mock datasets
export function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function formatDate(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getPastDates(count: number): string[] {
  const dates: string[] = [];
  const base = new Date('2026-10-20T00:00:00Z');
  for (let offset = 0; dates.length < count; offset++) {
    const d = new Date(base.getTime() - offset * 86400000);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) {
      dates.unshift(formatDate(d));
    }
  }
  return dates;
}
