import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  RefreshCw, 
  Filter, 
  Radio, 
  ChevronRight,
  ChevronDown,
  Sparkles,
  Search
} from 'lucide-react';
import { NewsItem, ThemeMode } from '../types';
import { INITIAL_NEWS_FEED } from '../data/mockData';
import { soundFx } from '../utils/audio';

interface LiveNewsFeedProps {
  blueprintMode: boolean;
  themeMode?: ThemeMode;
  onSelectTicker?: (ticker: string) => void;
}

export const LiveNewsFeed: React.FC<LiveNewsFeedProps> = ({
  blueprintMode,
  themeMode = 'dark',
  onSelectTicker,
}) => {
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS_FEED);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('news-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);

  // Periodic simulated live news injection (every 18-24 seconds)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const streamPool: Omit<NewsItem, 'id' | 'timestamp'>[] = [
      {
        headline: 'SEC Form 4: NVDA Executive leadership converts 45k incentive options under Rule 10b5-1 pre-scheduled plan',
        source: 'SEC EDGAR',
        category: 'SEC_FILING',
        sentiment: 'NEUTRAL',
        ticker: 'NVDA',
        impactScore: 68,
        summary: 'Scheduled 10b5-1 disposition filed with SEC. No discretionary open-market divestment detected by Floor 2 Fundamental Desk.',
        secFilingType: '8-K',
      },
      {
        headline: 'ECB Governing Council: Neutral interest rate band revised to 2.25%-2.50% amidst services disinflation',
        source: 'BLOOMBERG TERMINAL',
        category: 'MACRO_RATES',
        sentiment: 'BULLISH',
        impactScore: 84,
        summary: 'Frankfurt press conference reaffirms commitment to steady liquidity backstops for Tier-1 European clearing houses.',
      },
      {
        headline: 'SEC 8-K: TSMC reports monthly net revenue +33.8% YoY driven by 3nm AI accelerator foundry demand',
        source: 'SEC EDGAR',
        category: 'SEC_FILING',
        sentiment: 'BULLISH',
        ticker: 'NVDA',
        impactScore: 92,
        summary: 'Foundry capacity utilization reached 98.4%. Floor 1 quantitative hardware lead times confirmed within historical tolerance.',
        secFilingType: '8-K',
      },
      {
        headline: 'CFTC Commitments of Traders: Asset Manager S&P 500 net long contracts reach 14-month peak',
        source: 'CFTC',
        category: 'QUANT_ALPHA',
        sentiment: 'BULLISH',
        ticker: 'SPY',
        impactScore: 81,
        summary: 'Institutional systematic desks expanded equity beta exposure following macro volatility index (VIX) sub-14 compression.',
      },
    ];

    const interval = setInterval(() => {
      const randomItem = streamPool[Math.floor(Math.random() * streamPool.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newItem: NewsItem = {
        id: `news-${Date.now()}`,
        timestamp: timeStr,
        ...randomItem,
      };

      setNews((prev) => [newItem, ...prev.slice(0, 14)]);
      soundFx.playClick(1750, 0.015);
    }, 18000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const filteredNews = news.filter((item) => {
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
    const matchesSearch = 
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.ticker && item.ticker.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getSentimentBadge = (sentiment: NewsItem['sentiment']) => {
    switch (sentiment) {
      case 'BULLISH':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <TrendingUp className="w-3 h-3" />
            BULLISH
          </span>
        );
      case 'BEARISH':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <TrendingDown className="w-3 h-3" />
            BEARISH
          </span>
        );
      case 'ALERT':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" />
            RISK ALERT
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">
            NEUTRAL
          </span>
        );
    }
  };

  return (
    <div 
      id="live-news-intelligence-panel"
      className={`rounded-2xl border flex flex-col h-full backdrop-blur-xl transition-all ${
        blueprintMode 
          ? 'bg-black/70 border-cyan-500/30 text-cyan-300' 
          : themeMode === 'light'
          ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
          : 'bg-slate-950/70 border-slate-800/80 text-slate-200 shadow-xl'
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
        themeMode === 'light' && !blueprintMode ? 'border-slate-100 bg-slate-50/50' : 'border-white/5 bg-white/[0.02]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-xs tracking-wider uppercase font-mono ${
                themeMode === 'light' && !blueprintMode ? 'text-slate-950' : 'text-white'
              }`}>
                Live Macro & SEC Intelligence
              </h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <p className={`text-[10px] ${
              themeMode === 'light' && !blueprintMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Streaming EDGAR 8-K/10-Q & Central Bank Filings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick(1400);
              setIsLiveStreaming(!isLiveStreaming);
            }}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono border flex items-center gap-1.5 transition-all ${
              isLiveStreaming
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-semibold'
                : 'bg-slate-800/40 border-slate-700 text-slate-400'
            }`}
          >
            <Radio className={`w-3 h-3 ${isLiveStreaming ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{isLiveStreaming ? 'STREAM: LIVE' : 'STREAM: PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className={`p-3 border-b space-y-2 text-xs ${
        themeMode === 'light' && !blueprintMode ? 'border-slate-100 bg-white' : 'border-white/5 bg-black/20'
      }`}>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search SEC filings, tickers (NVDA, MSFT), FOMC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 text-[11px] rounded-lg border font-mono outline-none transition-all ${
              themeMode === 'light' && !blueprintMode
                ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                : 'bg-black/50 border-slate-800 text-slate-200 focus:border-emerald-400/60'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px] font-mono">
          {[
            { id: 'ALL', label: 'All Intel' },
            { id: 'SEC_FILING', label: 'SEC EDGAR' },
            { id: 'MACRO_RATES', label: 'Macro & Rates' },
            { id: 'QUANT_ALPHA', label: 'Quant Signals' },
            { id: 'SYSTEMIC_RISK', label: 'Systemic Risk' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundFx.playClick(1300);
                setFilterCategory(cat.id);
              }}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-all ${
                filterCategory === cat.id
                  ? blueprintMode
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : themeMode === 'light'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40'
                  : themeMode === 'light' && !blueprintMode
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* News Feed Stream List */}
      <div className="flex-1 overflow-y-auto divide-y max-h-[520px] scrollbar-thin">
        {filteredNews.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-mono text-xs">
            No intelligence items matching filter.
          </div>
        ) : (
          filteredNews.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div 
                key={item.id}
                className={`p-3.5 transition-all hover:bg-white/[0.02] cursor-pointer ${
                  isExpanded 
                    ? themeMode === 'light' && !blueprintMode 
                      ? 'bg-slate-50/80' 
                      : 'bg-white/[0.03]' 
                    : ''
                }`}
                onClick={() => {
                  soundFx.playClick(1600);
                  setExpandedId(isExpanded ? null : item.id);
                }}
              >
                {/* Meta Row */}
                <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${
                      themeMode === 'light' && !blueprintMode ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {item.source}
                    </span>
                    {item.secFilingType && (
                      <span className="px-1.5 py-0.2 rounded font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {item.secFilingType}
                      </span>
                    )}
                    {item.ticker && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playClick(1500);
                          if (onSelectTicker) onSelectTicker(item.ticker!);
                        }}
                        className="px-1.5 py-0.2 rounded font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20"
                      >
                        ${item.ticker}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {getSentimentBadge(item.sentiment)}
                    <span className="text-slate-500">{item.timestamp}</span>
                  </div>
                </div>

                {/* Headline */}
                <h4 className={`text-xs font-semibold leading-relaxed ${
                  themeMode === 'light' && !blueprintMode ? 'text-slate-900' : 'text-slate-100'
                }`}>
                  {item.headline}
                </h4>

                {/* Impact score bar */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-mono text-slate-500">Impact:</span>
                  <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.impactScore > 85 ? 'bg-emerald-400' : item.impactScore > 70 ? 'bg-amber-400' : 'bg-sky-400'
                      }`}
                      style={{ width: `${item.impactScore}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">{item.impactScore}</span>
                </div>

                {/* Collapsible details */}
                {isExpanded && (
                  <div className={`mt-2.5 p-2.5 rounded-lg border text-[11px] leading-normal font-mono animate-in fade-in duration-200 ${
                    themeMode === 'light' && !blueprintMode 
                      ? 'bg-white border-slate-200 text-slate-700' 
                      : 'bg-black/60 border-slate-800 text-slate-300'
                  }`}>
                    <p className="mb-1 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      Executive Briefing & SEC XBRL Analysis:
                    </p>
                    <p>{item.summary}</p>
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Floor Ingestion: Floor 2 (Fundamental & Macro)</span>
                      <span className="text-emerald-500 font-semibold">Validated by SEC_Auditor_Kratos ✓</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Status */}
      <div className={`p-2.5 border-t text-[10px] font-mono flex items-center justify-between ${
        themeMode === 'light' && !blueprintMode ? 'border-slate-100 bg-slate-50 text-slate-500' : 'border-white/5 bg-black/40 text-slate-500'
      }`}>
        <span>Sources: SEC EDGAR • Bloomberg B-PIPE • Federal Reserve</span>
        <span className="text-emerald-500">142 packets/sec</span>
      </div>
    </div>
  );
};
