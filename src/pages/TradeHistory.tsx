import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, History, Info } from 'lucide-react';
import { getTradeHistory } from '../lib/api';
import { ContractSymbol, TradeRecord } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { DataTable, Column } from '../components/ui/DataTable';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

type TradeSideFilter = 'All' | TradeRecord['side'];
type ContractFilter = 'All' | ContractSymbol;

const CONTRACT_SYMBOLS: ContractSymbol[] = ['GOLDM', 'GOLDTEN', 'GOLDGUINEA', 'GOLDPETAL'];

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  }).format(new Date(value));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeZone: 'UTC'
  }).format(new Date(`${value}T00:00:00Z`));
}

function getYearStart(asOfDate: string): string {
  const date = new Date(`${asOfDate}T00:00:00Z`);
  date.setUTCFullYear(date.getUTCFullYear() - 1);
  return date.toISOString().slice(0, 10);
}

export const TradeHistory: React.FC = () => {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [asOfDate, setAsOfDate] = useState<string | null>(null);
  const [sideFilter, setSideFilter] = useState<TradeSideFilter>('All');
  const [contractFilter, setContractFilter] = useState<ContractFilter>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTradeHistory();
      setAsOfDate(result.asOfDate);
      setTrades(result.trades);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load trade history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const yearStart = asOfDate ? getYearStart(asOfDate) : '';
  const yearTrades = useMemo(
    () => trades.filter((trade) => trade.dateTime.slice(0, 10) >= yearStart && trade.dateTime.slice(0, 10) <= (asOfDate ?? '')),
    [trades, yearStart, asOfDate]
  );
  const filteredTrades = useMemo(
    () => yearTrades
      .filter((trade) => sideFilter === 'All' || trade.side === sideFilter)
      .filter((trade) => contractFilter === 'All' || trade.symbol === contractFilter)
      .sort((a, b) => b.dateTime.localeCompare(a.dateTime)),
    [yearTrades, sideFilter, contractFilter]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="260px" height="32px" />
        <Skeleton variant="card" height="110px" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton variant="card" height="110px" />
          <Skeleton variant="card" height="110px" />
          <Skeleton variant="card" height="110px" />
        </div>
        <Skeleton variant="rectangular" height="360px" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load trade history"
        message={error}
        onRetry={loadData}
      />
    );
  }

  const columns: Column<TradeRecord>[] = [
    {
      key: 'dateTime',
      header: 'Trade Date & Time (IST)',
      render: (trade) => formatDateTime(trade.dateTime)
    },
    {
      key: 'id',
      header: 'Demo Record ID',
      render: (trade) => <span className="font-mono text-xs text-slate-500">{trade.id}</span>
    },
    {
      key: 'symbol',
      header: 'Contract & Expiry',
      render: (trade) => (
        <div>
          <span className="block font-bold">{trade.symbol}</span>
          <span className="text-xs text-slate-500">Expiry {formatDate(trade.expiryDate)}</span>
        </div>
      )
    },
    {
      key: 'side',
      header: 'Side',
      render: (trade) => (
        <Badge variant={trade.side === 'Buy' ? 'success' : 'danger'} size="sm">
          {trade.side === 'Buy' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {trade.side}
        </Badge>
      )
    },
    {
      key: 'quantityLots',
      header: 'Quantity',
      align: 'right',
      render: (trade) => `${trade.quantityLots} ${trade.quantityLots === 1 ? 'lot' : 'lots'}`
    },
    {
      key: 'executionPrice',
      header: 'Sample Price',
      align: 'right',
      render: (trade) => (
        <span className="font-mono">
          ₹{trade.executionPrice.toLocaleString('en-IN')} <span className="text-xs text-slate-500">/ {trade.quoteBaseGrams}g</span>
        </span>
      )
    },
    {
      key: 'source',
      header: 'Record Source',
      render: () => <span className="text-xs text-slate-500">Synthetic demo</span>
    }
  ];

  const buyCount = yearTrades.filter((trade) => trade.side === 'Buy').length;
  const sellCount = yearTrades.filter((trade) => trade.side === 'Sell').length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      <div>
        <div className="flex items-center flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Trade History
          </h1>
          <Badge variant="demo">Synthetic demo records</Badge>
        </div>
        <p className="mt-1 text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Buy and sell activity for the one-year period {yearStart ? formatDate(yearStart) : ''} – {asOfDate ? formatDate(asOfDate) : ''}.
        </p>
      </div>

      <Card variant="warning" className="border-amber-300/70 dark:border-amber-500/30">
        <div className="flex items-start gap-3">
          <Info size={20} className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300" />
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Not connected to your account or an official server</h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              These are fictional GoldLens demo records, not your personal trades, broker statements, or MCX-verified executions. Record IDs and prices are illustrative; no fills or profit/loss are asserted. An authenticated official trade-history API must be connected for verified records.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Buy Records"
          value={buyCount}
          subtext="Illustrative one-year entries"
          icon={<ArrowUpRight size={20} className="text-emerald-600 dark:text-emerald-400" />}
        />
        <StatCard
          label="Sell Records"
          value={sellCount}
          subtext="Illustrative one-year entries"
          icon={<ArrowDownRight size={20} className="text-rose-600 dark:text-rose-400" />}
        />
        <StatCard
          label="Records Shown"
          value={filteredTrades.length}
          subtext="After the selected filters"
          icon={<History size={20} className="text-slate-600 dark:text-slate-300" />}
        />
      </div>

      <section aria-labelledby="trade-records-heading" className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="trade-records-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              One-Year Buy & Sell Log
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Events are shown individually; buys and sells are not matched into positions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Side
              <select
                aria-label="Filter trade history by side"
                value={sideFilter}
                onChange={(event) => setSideFilter(event.target.value as TradeSideFilter)}
                className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option>All</option>
                <option>Buy</option>
                <option>Sell</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Contract
              <select
                aria-label="Filter trade history by contract"
                value={contractFilter}
                onChange={(event) => setContractFilter(event.target.value as ContractFilter)}
                className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option>All</option>
                {CONTRACT_SYMBOLS.map((symbol) => <option key={symbol}>{symbol}</option>)}
              </select>
            </label>
          </div>
        </div>
        <DataTable
          data={filteredTrades}
          columns={columns}
          keyExtractor={(trade) => trade.id}
          emptyMessage="No sample trade records match these filters for the selected year."
          caption="Synthetic one-year GoldLens buy and sell record examples"
        />
      </section>
    </div>
  );
};
