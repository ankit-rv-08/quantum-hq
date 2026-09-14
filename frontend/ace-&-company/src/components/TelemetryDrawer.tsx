import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  ChevronUp, 
  ChevronDown, 
  Play, 
  Pause, 
  Trash2, 
  Copy, 
  Check, 
  Radio, 
  Maximize2, 
  Minimize2, 
  Zap, 
  Cpu, 
  Layers, 
  Code, 
  Database,
  Filter,
  X
} from 'lucide-react';
import { EventLogEntry, FloorId, ThemeMode } from '../types';
import { INITIAL_EVENT_LOGS } from '../data/mockData';
import { soundFx } from '../utils/audio';

interface TelemetryDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  shiftActive: boolean;
  blueprintMode: boolean;
  themeMode?: ThemeMode;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  isOpen,
  onToggle,
  shiftActive,
  blueprintMode,
  themeMode = 'dark',
}) => {
  const [logs, setLogs] = useState<EventLogEntry[]>(INITIAL_EVENT_LOGS);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<EventLogEntry | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Periodic simulated real-time Kafka / Redis packet ingestion
  useEffect(() => {
    if (!isStreaming || !shiftActive) return;

    const streamTemplates: {
      floorId: FloorId;
      agentName: string;
      type: EventLogEntry['type'];
      message: string;
      redisChannel: string;
      langGraphNode: string;
      latencyUs: number;
    }[] = [
      {
        floorId: 1,
        agentName: 'Quant_Alpha_Bot',
        type: 'QUANT_SIGNAL',
        message: 'Pair spread z-score divergence +2.91 sigma on NVDA-MSFT.',
        redisChannel: 'pubsub:alpha:signals:floor_1',
        langGraphNode: 'node_statistical_arbitrage_evaluator',
        latencyUs: 142,
      },
      {
        floorId: 3,
        agentName: 'CRO_Sentinel',
        type: 'RISK_FLAG',
        message: 'Delta hedge threshold verified. SEC Rule 18f-4 VaR stress: 0.57% equity.',
        redisChannel: 'pubsub:risk:prudential_monitor',
        langGraphNode: 'node_var_stress_testing_agent',
        latencyUs: 88,
      },
      {
        floorId: 2,
        agentName: 'SEC_Auditor_Kratos',
        type: 'SEC_XBRL',
        message: 'Item 8.01 Form 8-K ingested. GAAP vs non-GAAP reconciliation verified.',
        redisChannel: 'pubsub:compliance:edgar_ingestion',
        langGraphNode: 'node_xbrl_taxonomy_validator',
        latencyUs: 210,
      },
      {
        floorId: 0,
        agentName: 'State_Bus_Orchestrator',
        type: 'STATE_BUS',
        message: 'Zero-copy shared memory buffer cleared: 48,200 tick packets synced.',
        redisChannel: 'pubsub:ipc:zero_copy_bus_0',
        langGraphNode: 'node_ground_bus_synchronizer',
        latencyUs: 42,
      },
      {
        floorId: 4,
        agentName: 'CIO_Agent_Alpha',
        type: 'BOARD_DIRECTIVE',
        message: 'Quorum consensus affirmative on pair rebalancing collar order.',
        redisChannel: 'pubsub:executive:board_vote_bus',
        langGraphNode: 'node_csuite_consensus_quorum',
        latencyUs: 310,
      },
    ];

    const interval = setInterval(() => {
      const template = streamTemplates[Math.floor(Math.random() * streamTemplates.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newEntry: EventLogEntry = {
        id: `bus-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: timeStr,
        floorId: template.floorId,
        agentName: template.agentName,
        type: template.type,
        message: template.message,
        rawJson: JSON.stringify(
          {
            timestamp_utc: new Date().toISOString(),
            stream_engine: 'Redis-v7.2.4-FastAPI-LangGraph',
            channel: template.redisChannel,
            node_id: template.langGraphNode,
            producer_agent: template.agentName,
            floor_partition: template.floorId,
            event_type: template.type,
            latency_us: template.latencyUs,
            payload: {
              summary: template.message,
              memory_addr: `0x7ffee${Math.floor(Math.random() * 99999).toString(16)}`,
              crc32_checksum: Math.random().toString(16).slice(2, 10).toUpperCase(),
            },
          },
          null,
          2
        ),
      };

      setLogs((prev) => [newEntry, ...prev.slice(0, 80)]);
    }, 2400);

    return () => clearInterval(interval);
  }, [isStreaming, shiftActive]);

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'ALL') return true;
    return log.type === filterType;
  });

  const handleCopyJson = (log: EventLogEntry) => {
    if (!log.rawJson) return;
    navigator.clipboard.writeText(log.rawJson);
    setCopiedId(log.id);
    soundFx.playClick(1900);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeStyle = (type: EventLogEntry['type']) => {
    switch (type) {
      case 'QUANT_SIGNAL':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'RISK_FLAG':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'SEC_XBRL':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'BOARD_DIRECTIVE':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'STATE_BUS':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <>
      {/* Floating Bottom Right Toggle Pill when Closed */}
      {!isOpen && (
        <button
          onClick={() => {
            soundFx.playClick(1400);
            onToggle();
          }}
          className={`fixed bottom-4 right-6 z-40 px-4 py-2.5 rounded-xl border flex items-center gap-2.5 font-mono text-xs font-semibold shadow-2xl backdrop-blur-xl transition-all hover:scale-105 ${
            blueprintMode
              ? 'bg-[#04091a]/95 border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
              : themeMode === 'light'
              ? 'bg-slate-900/95 border-slate-700 text-white shadow-xl'
              : 'bg-[#080c18]/95 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
          }`}
          title="Open Collapsible Live Engineering Telemetry Drawer"
        >
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>THE MATRIX // TELEMETRY BUS</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <ChevronUp className="w-3.5 h-3.5 ml-1 text-slate-400" />
        </button>
      )}

      {/* Slide-out Bottom Drawer */}
      {isOpen && (
        <div
          id="engineering-telemetry-drawer"
          className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-300 border-t shadow-2xl backdrop-blur-2xl flex flex-col ${
            isMaximized ? 'h-[75vh]' : 'h-[360px]'
          } ${
            blueprintMode
              ? 'bg-[#020612]/98 border-cyan-500/40 text-cyan-300'
              : 'bg-[#04060d]/98 border-slate-700/80 text-slate-200'
          }`}
        >
          {/* Drawer Top Header / Controls Bar */}
          <div className="px-4 py-2.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-3 text-xs font-mono">
            {/* Title & Engine info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span className="tracking-wider">LANGGRAPH // REDIS EVENT STREAM</span>
              </div>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                0.24ms LATENCY
              </span>
              <span className="hidden md:inline-block text-[10px] text-slate-400">
                FastAPI Gateway • 5 Floor Shards • Zero-Copy RingBuffer
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="hidden lg:flex items-center gap-1 text-[10px]">
              {['ALL', 'QUANT_SIGNAL', 'RISK_FLAG', 'SEC_XBRL', 'BOARD_DIRECTIVE', 'STATE_BUS'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    soundFx.playClick(1500);
                    setFilterType(type);
                  }}
                  className={`px-2 py-1 rounded transition-all ${
                    filterType === type
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                      : 'bg-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFx.playClick(1400);
                  setIsStreaming(!isStreaming);
                }}
                className={`px-2 py-1 rounded text-[11px] border flex items-center gap-1 ${
                  isStreaming
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title={isStreaming ? 'Pause streaming' : 'Resume streaming'}
              >
                {isStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span className="hidden sm:inline">{isStreaming ? 'Streaming' : 'Paused'}</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick(1200);
                  setLogs([]);
                }}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5"
                title="Clear Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5"
                title={isMaximized ? 'Restore Drawer' : 'Maximize Drawer'}
              >
                {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  soundFx.playClick(1200);
                  onToggle();
                }}
                className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                title="Collapse Drawer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body: Log Stream Table & JSON Inspector */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10 font-mono text-xs">
            {/* Stream Column */}
            <div 
              ref={logContainerRef}
              className="md:col-span-7 lg:col-span-8 overflow-y-auto p-3 space-y-1.5 scrollbar-thin max-h-full"
            >
              {filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => {
                      soundFx.playClick(1700);
                      setSelectedLog(log);
                    }}
                    className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 text-[11px] ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-400/80 shadow-md text-emerald-200'
                        : 'bg-black/40 hover:bg-white/[0.04] border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${getTypeStyle(log.type)}`}>
                        {log.type}
                      </span>
                      <span className="text-amber-400 font-semibold shrink-0 text-[10px]">
                        F{log.floorId}:{log.agentName}
                      </span>
                      <span className="truncate text-slate-300 text-[11px]">{log.message}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyJson(log);
                        }}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200"
                        title="Copy Raw JSON"
                      >
                        {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">JSON →</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Raw JSON Inspection Pane */}
            <div className="md:col-span-5 lg:col-span-4 p-3 bg-black/60 overflow-y-auto flex flex-col justify-between scrollbar-thin">
              {selectedLog ? (
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Code className="w-3.5 h-3.5" />
                      <span>PACKET PAYLOAD #{selectedLog.id}</span>
                    </div>
                    <button
                      onClick={() => handleCopyJson(selectedLog)}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1 text-[10px]"
                    >
                      {copiedId === selectedLog.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === selectedLog.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] leading-relaxed text-emerald-300 font-mono overflow-x-auto p-2 rounded bg-black/80 border border-white/5">
                    {selectedLog.rawJson || JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <Database className="w-8 h-8 text-slate-700" />
                  <p className="text-xs">Click any telemetry packet to inspect its parsed JSON payload and LangGraph memory state.</p>
                </div>
              )}

              {/* Engine Status Bar */}
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                <span>Buffer: RingBuffer (SharedMemory)</span>
                <span className="text-emerald-400 font-bold">ACK: 200 OK</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
