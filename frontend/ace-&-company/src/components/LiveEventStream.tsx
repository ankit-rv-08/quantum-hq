import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Activity, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Trash2, 
  Copy, 
  Check, 
  Cpu, 
  Zap, 
  Layers,
  Radio,
  FileCode
} from 'lucide-react';
import { EventLogEntry, FloorId } from '../types';
import { INITIAL_EVENT_LOGS } from '../data/mockData';
import { soundFx } from '../utils/audio';

interface LiveEventStreamProps {
  shiftActive: boolean;
  blueprintMode: boolean;
  themeMode?: 'dark' | 'light';
}

export const LiveEventStream: React.FC<LiveEventStreamProps> = ({ shiftActive, blueprintMode, themeMode = 'dark' }) => {
  const [logs, setLogs] = useState<EventLogEntry[]>(INITIAL_EVENT_LOGS);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterFloor, setFilterFloor] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedRawLog, setSelectedRawLog] = useState<EventLogEntry | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Periodic simulated live event arrival
  useEffect(() => {
    if (isPaused || !shiftActive) return;

    const eventPool: Omit<EventLogEntry, 'id' | 'timestamp'>[] = [
      {
        floorId: 1,
        agentName: 'Quant_Alpha_Bot',
        type: 'QUANT_SIGNAL',
        message: 'Tick anomaly: Volume z-score +2.91 on NVDA-MSFT pair spread.',
      },
      {
        floorId: 2,
        agentName: 'SEC_Auditor_Kratos',
        type: 'SEC_XBRL',
        message: 'ASC 606 revenue item validated for Cloud SaaS cohort. Gross margin delta +82 bps.',
      },
      {
        floorId: 3,
        agentName: 'CRO_Sentinel',
        type: 'RISK_FLAG',
        message: 'Calculated 1-day 99% Parametric VaR: $14.18M (0.57% firm capital).',
      },
      {
        floorId: 0,
        agentName: 'State_Bus_Orchestrator',
        type: 'STATE_BUS',
        message: 'Dispatched 48,200 tick packets to Floor 1 via zero-copy shared memory.',
      },
      {
        floorId: 4,
        agentName: 'CIO_Agent_Alpha',
        type: 'BOARD_DIRECTIVE',
        message: 'Affirmed capital allocation parameters with Shareholder Proxy and Risk Chair.',
      },
      {
        floorId: 2,
        agentName: 'Macro_Strategist_K1',
        type: 'INFO',
        message: 'Sentiment scoring on European Central Bank speech completed: Neutral-Dovish (0.14).',
      },
    ];

    const interval = setInterval(() => {
      const randomEvt = eventPool[Math.floor(Math.random() * eventPool.length)];
      const time = new Date().toTimeString().split(' ')[0];
      const newEntry: EventLogEntry = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: time,
        ...randomEvt,
        rawJson: JSON.stringify({
          stream: 'KRATOS_KAFKA_BUS_0',
          partition: randomEvt.floorId,
          producer: randomEvt.agentName,
          payload_type: randomEvt.type,
          data: randomEvt.message,
          latency_us: Math.floor(Math.random() * 320) + 120,
        }, null, 2),
      };

      setLogs((prev) => [newEntry, ...prev.slice(0, 75)]);
      soundFx.playClick(1900, 0.01);
    }, 2800);

    return () => clearInterval(interval);
  }, [isPaused, shiftActive]);

  const filteredLogs = logs.filter((l) => {
    if (filterType !== 'ALL' && l.type !== filterType) return false;
    if (filterFloor !== 'ALL' && l.floorId.toString() !== filterFloor) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        l.message.toLowerCase().includes(term) ||
        l.agentName.toLowerCase().includes(term) ||
        l.type.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleCopyRaw = () => {
    if (!selectedRawLog?.rawJson) return;
    navigator.clipboard.writeText(selectedRawLog.rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'QUANT_SIGNAL':
        return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30';
      case 'RISK_FLAG':
        return 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30';
      case 'BOARD_DIRECTIVE':
        return 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30';
      case 'SEC_XBRL':
        return 'bg-violet-500/20 text-violet-600 dark:text-violet-300 border-violet-500/30';
      case 'STATE_BUS':
        return 'bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const isLight = themeMode === 'light' && !blueprintMode;

  return (
    <div id="live-event-stream-view" className="space-y-6 max-w-7xl mx-auto">
      
      {/* Stream Control Header */}
      <div className={`p-6 rounded-3xl border backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        blueprintMode
          ? 'bg-cyan-950/30 border-cyan-500/30'
          : isLight
          ? 'bg-white/95 border-slate-200/90 shadow-sm'
          : 'bg-slate-950/80 border-slate-800/80'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 mb-1">
            <Terminal className="w-4 h-4 text-emerald-500" />
            <span>KRATOS // LOW-LATENCY SSE EVENT BUS</span>
          </div>
          <h2 className={`text-2xl font-bold font-['Cinzel',serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Firm State Bus & Event Stream
          </h2>
          <p className={`text-xs mt-1 max-w-xl ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Real-time event loop mirroring Redis publish/subscribe partitions between Floor 0 infrastructure and the executive boardroom.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              isPaused
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? 'Resume Stream' : 'Pause Stream'}
          </button>

          <button
            onClick={() => setLogs([])}
            className={`p-2 rounded-xl border transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-rose-600'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400'
            }`}
            title="Clear Stream Buffer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
        isLight ? 'bg-white/95 border-slate-200/90 shadow-sm' : 'bg-slate-950/70 border-slate-800'
      }`}>
        
        {/* Search */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border flex-1 min-w-[200px] max-w-sm ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-slate-800'
        }`}>
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events, tickers, agents..."
            className={`bg-transparent border-none text-xs focus:outline-none w-full font-mono placeholder-slate-400 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Payload:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`border text-xs px-2.5 py-1.5 rounded-xl font-mono focus:outline-none ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500'
                : 'bg-black border-slate-800 text-slate-200 focus:border-emerald-400'
            }`}
          >
            <option value="ALL">All Payloads</option>
            <option value="QUANT_SIGNAL">Quant Signal</option>
            <option value="RISK_FLAG">Risk Flag</option>
            <option value="BOARD_DIRECTIVE">Board Directive</option>
            <option value="SEC_XBRL">SEC XBRL</option>
            <option value="STATE_BUS">State Bus</option>
          </select>
        </div>

        {/* Floor Filter */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Floor:</span>
          <select
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
            className={`border text-xs px-2.5 py-1.5 rounded-xl font-mono focus:outline-none ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500'
                : 'bg-black border-slate-800 text-slate-200 focus:border-emerald-400'
            }`}
          >
            <option value="ALL">All Floors (0-4)</option>
            <option value="4">Floor 4: Executive Board</option>
            <option value="3">Floor 3: Risk Office</option>
            <option value="2">Floor 2: Fundamental</option>
            <option value="1">Floor 1: Quant Desk</option>
            <option value="0">Floor 0: State Bus</option>
          </select>
        </div>

        <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Showing {filteredLogs.length} events
        </span>
      </div>

      {/* Main Terminal View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Logs Table (8 cols) */}
        <div className={`lg:col-span-8 p-6 rounded-3xl border font-mono text-xs shadow-2xl space-y-2 transition-colors ${
          blueprintMode
            ? 'bg-cyan-950/30 border-cyan-500/30'
            : isLight
            ? 'bg-white/95 border-slate-200/90 shadow-sm'
            : 'bg-slate-950/80 border-slate-800/80'
        }`}>
          <div className={`flex items-center justify-between text-[11px] pb-2 border-b ${
            isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-500'
          }`}>
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
              <span>LIVE SSE TELEMETRY STREAM</span>
            </span>
            <span>Target: Apple Metal / Local GGUF Bus</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {filteredLogs.map((log) => {
              const isSelected = selectedRawLog?.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => {
                    soundFx.playClick(1100);
                    setSelectedRawLog(log);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1 ${
                    isSelected
                      ? isLight
                        ? 'bg-cyan-50/80 border-cyan-500 shadow-md'
                        : 'bg-slate-900 border-cyan-400 shadow-md'
                      : isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      : 'bg-black/40 hover:bg-slate-900/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>[{log.timestamp}]</span>
                      <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        F{log.floorId} // {log.agentName}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${getTypeBadge(log.type)}`}>
                      {log.type}
                    </span>
                  </div>

                  <p className={`text-[11px] leading-relaxed pl-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {log.message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Event Raw JSON Inspector (4 cols) */}
        <div className={`lg:col-span-4 p-6 rounded-3xl border font-mono text-xs space-y-4 transition-colors ${
          blueprintMode
            ? 'bg-cyan-950/30 border-cyan-500/30'
            : isLight
            ? 'bg-white/95 border-slate-200/90 shadow-sm'
            : 'bg-slate-950/80 border-slate-800/80'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <FileCode className="w-4 h-4 text-cyan-500" />
              <span>Raw JSON Packet</span>
            </span>

            {selectedRawLog && (
              <button
                onClick={handleCopyRaw}
                className={`px-2 py-1 rounded text-[10px] flex items-center gap-1 transition ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {selectedRawLog ? (
            <div className="space-y-3">
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>Packet ID: </span>
                <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{selectedRawLog.id}</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[420px]">
                {selectedRawLog.rawJson || JSON.stringify(selectedRawLog, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Terminal className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">Click any telemetry event on the left to inspect its raw JSON payload and serialize parameters.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
