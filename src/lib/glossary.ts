export interface GlossaryTerm {
  term: string;
  key: string;
  shortDefinition: string;
  formula?: string;
  detailedExplanation: string;
  practicalExample: string;
}

export const GLOSSARY_TERMS: Record<string, GlossaryTerm> = {
  'basis-point': {
    term: 'Basis Point (bps)',
    key: 'basis-point',
    shortDefinition: 'One hundredth of a percentage point (0.01% or 0.0001).',
    formula: '1 bps = 0.01% = 0.0001',
    detailedExplanation:
      'Used in bullion trading to measure fractional differences between normalized contract prices and calculate friction hurdles without decimal clutter.',
    practicalExample:
      'If gold is ₹7,500/g, 10 bps is ₹7.50 per gram. A 12 bps bid-ask spread on GOLDPETAL equals ₹9.00/g in execution friction.'
  },
  'z-score': {
    term: 'Z-Score (Sigma)',
    key: 'z-score',
    shortDefinition: 'The number of standard deviations a contract spread has drifted from its historical rolling mean.',
    formula: 'Z = (Spread - Mean) / Standard Deviation',
    detailedExplanation:
      'Indicates statistical anomaly magnitude. The proposed GoldLens workflow includes configurable Z-score thresholds, followed by cost and risk gates; no alert calculation is running in this frontend demo.',
    practicalExample:
      'A Z-score of +2.4 indicates the price spread is wider than 98% of normal historical observations, signaling potential mean reversion.'
  },
  'roll-down': {
    term: 'Roll-Down',
    key: 'roll-down',
    shortDefinition: 'Price gain or loss accrued purely as a futures contract approaches expiry along an upward sloping contango curve.',
    formula: 'Roll Down = Futures Price(T1) - Futures Price(T0) along static curve',
    detailedExplanation:
      'In a normal contango gold futures market (where deferred contracts trade higher to reflect financing and storage), a held long position naturally rolls down towards spot as delivery nears.',
    practicalExample:
      'Holding a 45-day contract at ₹7,490 that rolls down to ₹7,465 at maturity yields ₹25/g in carry decay.'
  },
  'structural-premium': {
    term: 'Structural Premium',
    key: 'structural-premium',
    shortDefinition: 'Persistent price elevation in smaller contracts due to retail convenience, packaging, and non-institutional participation.',
    detailedExplanation:
      'A smaller contract may have a persistent premium related to denomination or liquidity. Any premium estimate must be measured from validated historical data; the demo fixtures do not establish a real premium.',
    practicalExample:
      'A strategy could estimate a pair-specific baseline before evaluating deviations. No such empirical premium is verified by this frontend.'
  },
  'fine-gold': {
    term: 'Fine Gold Basis (999 Purity)',
    key: 'fine-gold',
    shortDefinition: 'Mathematical normalization of gold purity to standard 999.0 parts per thousand equivalent.',
    formula: 'Normalized Price = Settle Price / Quote Grams * (0.999 / Contract Purity)',
    detailedExplanation:
      'MCX contracts have different purities: GOLDM is 995 purity (99.5% pure gold), whereas GOLDTEN, GOLDGUINEA, and GOLDPETAL are 999 purity (99.9% pure gold). GoldLens normalizes all 4 to 999 pure gold so comparisons are true like-for-like.',
    practicalExample:
      'A ₹74,500 settle on GOLDM (10g of 995 purity) corresponds to ₹7,479.90 per gram of 999 fine gold.'
  },
  'tender-period': {
    term: 'Tender Period',
    key: 'tender-period',
    shortDefinition: 'The pre-expiry window where contracts become delivery-marked and sellers can tender physical gold.',
    detailedExplanation:
      'The workflow proposes monitoring the official contract-specific tender window. Exchange dates and delivery rules should be confirmed against current official contract specifications.',
    practicalExample:
      'The proposed workflow would exclude contracts within a configurable number of sessions from tender. This frontend does not calculate or apply that gate.'
  },
  'carry': {
    term: 'Cost of Carry',
    key: 'carry',
    shortDefinition: 'The financial cost of holding physical gold (interest rate financing + storage + insurance - convenience yield).',
    formula: 'Futures Price = Spot * [1 + (r + storage) * (t / 365)]',
    detailedExplanation:
      'Because gold is an investment metal, futures trade at a premium to spot roughly equal to RBI risk-free repo rates minus vaulting benefits. Deviations across contract tenors reveal arbitrage bounds.',
    practicalExample:
      'An annualized carry of 6.85% on GOLDM reflects standard rupee funding rates and secure custody overhead.'
  },
  'half-life': {
    term: 'Half-Life of Mean Reversion',
    key: 'half-life',
    shortDefinition: 'Estimated time (in trading days) required for a dislocated spread to decay halfway back to its equilibrium mean.',
    formula: 'Half-Life = -ln(2) / λ (from Ornstein-Uhlenbeck regression)',
    detailedExplanation:
      'A shorter half-life may indicate quicker reversion under the fitted model. The workflow proposes a configurable holding horizon, but no regression or rejection gate runs in this frontend demo.',
    practicalExample:
      'A pair with a half-life of 4.2 days will typically recover 75% of its anomalous deviation within 8 trading sessions.'
  },
  'holdout': {
    term: 'Holdout Horizon',
    key: 'holdout',
    shortDefinition: 'Strict maximum time limit an arbitrage or relative-value position may remain open before mandatory stop-out.',
    detailedExplanation:
      'Prevents capital from getting trapped in structural regime shifts or widening spreads. If mean reversion does not occur within the preset window (e.g. 10–15 days), the position is cut regardless of PnL.',
    practicalExample:
      'A position opened with a 10-day holdout is liquidated at market on day 10, preventing exposure to approaching contract tender cycles.'
  },
  'slippage': {
    term: 'Execution Slippage',
    key: 'slippage',
    shortDefinition: 'The adverse price difference between expected mid-market quote and actual executed fill price.',
    detailedExplanation:
      'Because GoldLens analyzes synthetic pairs across two distinct contracts, entering requires crossing the spread on both instruments simultaneously. Micro contracts like GOLDPETAL carry higher percentage slippage.',
    practicalExample:
      'Entering 1 lot of GOLDM and 100 lots of GOLDPETAL incurs ~11.4 bps in combined bidirectional bid-ask spread and impact cost.'
  }
};
