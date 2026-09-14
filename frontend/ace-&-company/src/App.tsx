import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Award, 
  Terminal, 
  Zap, 
  Layers, 
  Radio, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Database,
  Users,
  Sparkles,
  Compass
} from 'lucide-react';
import { FloorId, FloorData, StockTicker, FirmStatusType, TelemetryPacket, AppTab, ThemeMode, TimeOfDay } from './types';
import { INITIAL_STOCKS, FLOORS_DATA } from './data/mockData';
import { TopTickerBar } from './components/TopTickerBar';
import { ThreeSkyscraper } from './components/ThreeSkyscraper';
import { FloorInspectorModal } from './components/FloorInspectorModal';
import { BoardroomWarRoom } from './components/BoardroomWarRoom';
import { BoardroomArchive } from './components/BoardroomArchive';
import { AgentDirectory } from './components/AgentDirectory';
import { LiveEventStream } from './components/LiveEventStream';
import { MarketShockSimulator } from './components/MarketShockSimulator';
import { LiveNewsFeed } from './components/LiveNewsFeed';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { soundFx } from './utils/audio';
import { useFirmTelemetry } from './hooks/useWebSocket';
import { 
  getPersistedTab, 
  setPersistedTab, 
  getPersistedFloor, 
  setPersistedFloor, 
  getPersistedBlueprintMode, 
  setPersistedBlueprintMode,
  getPersistedThemeMode,
  setPersistedThemeMode,
  getPersistedTimeOfDay,
  setPersistedTimeOfDay,
  STORAGE_KEYS
} from './utils/storage';

export default function App() {
  const { isConnected, messages, sendVeto } = useFirmTelemetry();
  const [stocks, setStocks] = useState<StockTicker[]>(INITIAL_STOCKS);
  const [floors, setFloors] = useState<FloorData[]>(FLOORS_DATA);
  const [selectedFloorId, setSelectedFloorId] = useState<FloorId | null>(() => getPersistedFloor(4));
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AppTab>(() => getPersistedTab('command'));
  const [shiftActive, setShiftActive] = useState<boolean>(true);
  const [blueprintMode, setBlueprintMode] = useState<boolean>(() => getPersistedBlueprintMode(false));
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getPersistedThemeMode('dark'));
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getPersistedTimeOfDay('sunset'));
  const [firmStatus, setFirmStatus] = useState<FirmStatusType>('ACTIVE_SHIFT');
  const [isShockModalOpen, setIsShockModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [activePackets, setActivePackets] = useState<TelemetryPacket[]>([]);
  const [lastShockNotification, setLastShockNotification] = useState<string | null>(null);
  const [isTelemetryDrawerOpen, setIsTelemetryDrawerOpen] = useState<boolean>(false);

  // Sync activeTab state changes to persistence layer
  useEffect(() => {
    setPersistedTab(activeTab);
  }, [activeTab]);

  // Sync selectedFloorId state changes to persistence layer
  useEffect(() => {
    setPersistedFloor(selectedFloorId);
  }, [selectedFloorId]);

  // Sync blueprintMode state changes to persistence layer
  useEffect(() => {
    setPersistedBlueprintMode(blueprintMode);
  }, [blueprintMode]);

  // Sync themeMode state changes to persistence layer and document class
  useEffect(() => {
    setPersistedThemeMode(themeMode);
    if (themeMode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [themeMode]);

  // Sync timeOfDay state changes to persistence layer
  useEffect(() => {
    setPersistedTimeOfDay(timeOfDay);
  }, [timeOfDay]);

  // Synchronize across browser tabs/windows if storage is updated externally
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.ACTIVE_TAB) {
        setActiveTab(getPersistedTab('command'));
      } else if (e.key === STORAGE_KEYS.SELECTED_FLOOR) {
        setSelectedFloorId(getPersistedFloor(4));
      } else if (e.key === STORAGE_KEYS.BLUEPRINT_MODE) {
        setBlueprintMode(getPersistedBlueprintMode(false));
      } else if (e.key === STORAGE_KEYS.THEME_MODE) {
        setThemeMode(getPersistedThemeMode('dark'));
      } else if (e.key === STORAGE_KEYS.TIME_OF_DAY) {
        setTimeOfDay(getPersistedTimeOfDay('sunset'));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Real-time stock ticks simulation (Bloomberg style micro-deltas)
  useEffect(() => {
    if (!shiftActive) return;

    const interval = setInterval(() => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          // Random small fluctuation (-0.3% to +0.35%)
          const pctDelta = (Math.random() - 0.48) * 0.007;
          const newPrice = Math.max(1, +(stock.price * (1 + pctDelta)).toFixed(2));
          const changeVal = +(newPrice - (stock.price - stock.change)).toFixed(2);
          const changePct = +((changeVal / (stock.price - stock.change)) * 100).toFixed(2);
          const newSparkline = [...stock.sparkline.slice(1), newPrice];

          return {
            ...stock,
            price: newPrice,
            change: changeVal,
            changePercent: changePct,
            high: Math.max(stock.high, newPrice),
            low: Math.min(stock.low, newPrice),
            sparkline: newSparkline,
          };
        })
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [shiftActive]);

  // Handle floor selection from 3D model or HUD
  const handleSelectFloor = (id: FloorId) => {
    setSelectedFloorId(id);
    setIsInspectorOpen(true);
  };

  // Execute Market Shock & inject into firm state
  const handleExecuteShock = (title: string, details: string) => {
    setLastShockNotification(`Macro Shock Injected: "${title}" — Cascade resolved at Floor 4.`);
    setTimeout(() => setLastShockNotification(null), 6000);

    // Briefly switch to Boardroom Archive or Skyscraper
    setSelectedFloorId(4);
    setIsInspectorOpen(true);
  };

  const selectedFloor = floors.find((f) => f.id === selectedFloorId) || null;

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 selection:bg-emerald-500/30 selection:text-emerald-300 flex flex-col ${
        blueprintMode 
          ? 'bg-[#020408] text-cyan-400 font-mono' 
          : themeMode === 'light'
          ? 'bg-slate-50 text-slate-900 font-sans'
          : 'bg-[#030508] text-slate-100 font-sans'
      }`}
    >
      {/* 1. TOP ROOFTOP FEED & LIVE TICKER */}
      <TopTickerBar
        stocks={stocks}
        firmStatus={firmStatus}
        shiftActive={shiftActive}
        onToggleShift={() => setShiftActive(!shiftActive)}
        blueprintMode={blueprintMode}
        onToggleBlueprint={() => setBlueprintMode(!blueprintMode)}
        onTriggerStressTest={() => setIsShockModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        themeMode={themeMode}
        onToggleTheme={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
        timeOfDay={timeOfDay}
        onChangeTimeOfDay={(tod) => setTimeOfDay(tod)}
      />

      {/* Shock Alert Notification Toast */}
      {lastShockNotification && (
        <div className="bg-rose-500 text-white text-xs font-mono font-bold px-6 py-2.5 text-center flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300 shadow-xl">
          <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>{lastShockNotification}</span>
        </div>
      )}

      {/* 2. CORPORATE NAVIGATION BAR (Institutional & Executive Nomenclature) */}
      <nav 
        id="main-app-nav"
        className={`border-b transition-colors ${
          blueprintMode 
            ? 'border-cyan-500/20 bg-black/60' 
            : themeMode === 'light'
            ? 'border-slate-200/90 bg-white/85 shadow-sm'
            : 'border-slate-800/80 bg-[#080e18]/80'
        } backdrop-blur-xl sticky top-[77px] z-40`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-2.5">
          <div className="flex items-center gap-2">
            {[
              { id: 'command', label: 'Enterprise Command Structure', icon: Building2, desc: 'Global Operations Matrix & 3D Building' },
              { id: 'boardroom', label: 'Executive Consensus Arena', icon: Users, desc: 'Live Deliberations & Quorum Votes' },
              { id: 'intelligence', label: 'Bloomberg Wire & SEC Ingestion', icon: Radio, desc: 'Real-Time Market Stimuli & SEC Filings' },
              { id: 'archive', label: 'Institutional Audit Trail', icon: Calendar, desc: 'Immutable Governance Records' },
              { id: 'performance', label: 'Agentic Telemetry & Workforce Analytics', icon: Award, desc: '10h Shift Caps & Model Drift' },
              { id: 'terminal', label: 'Ground State Telemetry Bus', icon: Terminal, desc: 'Kafka / Redis Event Stream' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundFx.playClick(1500);
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? blueprintMode
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] font-bold'
                        : 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 scale-[1.02]'
                      : blueprintMode
                      ? 'text-cyan-600 hover:text-cyan-300 hover:bg-cyan-950/40'
                      : themeMode === 'light'
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                  title={tab.desc}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {/* Live Redis Pipeline Stream Drawer Toggle */}
            <button
              onClick={() => {
                soundFx.playClick(1600);
                setIsTelemetryDrawerOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all shadow-sm ${
                blueprintMode
                  ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50'
                  : themeMode === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-emerald-400'
              }`}
              title="Open real-time Redis/LangGraph event packet inspection drawer"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Telemetry Drawer</span>
              <span className="text-[10px] px-1 py-0.2 bg-emerald-500/20 text-emerald-400 rounded">LIVE</span>
            </button>

            <div className={`hidden xl:flex items-center gap-3 ${
              themeMode === 'light' && !blueprintMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <span className={isConnected ? 'text-emerald-500' : 'text-rose-400'}>
                WS {isConnected ? 'CONNECTED' : 'OFFLINE'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>5 Floors Monitored</span>
              </span>
              <span>•</span>
              <span className="text-emerald-500 font-semibold">Zero Hallucinations</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 flex-grow w-full">

        {/* COMPACT MODULAR MARKET WIDGETS (Hiknescreen Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stocks.map((stock) => {
            const isPositive = stock.change >= 0;
            return (
              <div
                key={stock.symbol}
                className={`p-3.5 rounded-2xl border backdrop-blur-xl transition-all hover:scale-[1.02] cursor-pointer ${
                  blueprintMode 
                    ? 'bg-black/60 border-cyan-500/30 text-cyan-300 shadow-md' 
                    : themeMode === 'light'
                    ? 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
                    : 'bg-slate-950/60 border-slate-800/80 shadow-xl'
                }`}
                onClick={() => soundFx.playClick(1200)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className={`font-bold text-xs font-mono ${
                      themeMode === 'light' && !blueprintMode ? 'text-slate-950' : 'text-white'
                    }`}>{stock.symbol}</span>
                    <p className={`text-[10px] truncate max-w-[90px] ${
                      themeMode === 'light' && !blueprintMode ? 'text-slate-500' : 'text-slate-400'
                    }`}>{stock.label || stock.name}</p>
                  </div>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                    isPositive 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {isPositive ? '+' : ''}{stock.changePercent.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-end justify-between mt-2">
                  <span className={`text-base font-bold font-mono font-mono-numbers ${
                    themeMode === 'light' && !blueprintMode ? 'text-slate-950' : 'text-white'
                  }`}>
                    ${stock.price.toFixed(2)}
                  </span>
                  
                  {/* Mini Sparkline Bar Array */}
                  <div className="flex items-end gap-1 h-5">
                    {stock.sparkline.map((val, i) => {
                      const min = Math.min(...stock.sparkline);
                      const max = Math.max(...stock.sparkline);
                      const range = max - min || 1;
                      const h = Math.max(3, Math.min(18, ((val - min) / range) * 18));
                      return (
                        <div
                          key={i}
                          style={{ height: `${h}px` }}
                          className={`w-1 rounded-t ${
                            isPositive ? 'bg-emerald-500/80' : 'bg-rose-500/80'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* TAB 1: ENTERPRISE COMMAND STRUCTURE (Building as Main Piece) */}
        {activeTab === 'command' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Architectural Centerpiece Marquee */}
            <div className={`p-5 rounded-2xl border backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              blueprintMode 
                ? 'bg-black/60 border-cyan-500/30' 
                : themeMode === 'light'
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-black/40 border-white/10'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <h3 className={`font-bold tracking-wider text-sm flex items-center gap-2 ${
                    themeMode === 'light' && !blueprintMode ? 'text-slate-950' : 'text-white'
                  }`}>
                    <span>ACE & COMPANY // GLOBAL TOWER ONE</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      SEC-992-HQ
                    </span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${
                    themeMode === 'light' && !blueprintMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    New York Financial District • Multi-Agent Autonomous Hedge Fund Core • Architectural Interactive Dissection
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-400 self-start md:self-auto">
                <span className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
                  themeMode === 'light' && !blueprintMode
                    ? 'bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-white/5 border-white/10 text-slate-300'
                }`}>
                  <Compass className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mode: {blueprintMode ? 'Blueprint Schematic' : 'Crystal Glass Monolith'}</span>
                </span>
                <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Synchronized
                </span>
              </div>
            </div>

            {/* Skyscraper Monolith 3D Interactive Masterpiece */}
            <div className="space-y-4">
              <ThreeSkyscraper
                floors={floors}
                selectedFloorId={selectedFloorId}
                onSelectFloor={handleSelectFloor}
                blueprintMode={blueprintMode}
                activePackets={activePackets}
                shiftActive={shiftActive}
                timeOfDay={timeOfDay}
                themeMode={themeMode}
              />
            </div>

            {/* Real-Time Live Bloomberg & SEC News Wire Ingestion (Command Deck Feed) */}
            <div className="pt-2">
              <LiveNewsFeed blueprintMode={blueprintMode} themeMode={themeMode} />
            </div>

          </div>
        )}

        {/* TAB 2: EXECUTIVE CONSENSUS ARENA */}
        {activeTab === 'boardroom' && (
          <div className="animate-in fade-in duration-300">
            <BoardroomWarRoom
              floors={floors}
              blueprintMode={blueprintMode}
              shiftActive={shiftActive}
              themeMode={themeMode}
              onVeto={sendVeto}
            />
          </div>
        )}

        {/* TAB: BLOOMBERG WIRE & SEC INGESTION */}
        {activeTab === 'intelligence' && (
          <div className="animate-in fade-in duration-300">
            <LiveNewsFeed blueprintMode={blueprintMode} themeMode={themeMode} />
          </div>
        )}

        {/* TAB 3: INSTITUTIONAL AUDIT TRAIL */}
        {activeTab === 'archive' && (
          <div className="animate-in fade-in duration-300">
            <BoardroomArchive blueprintMode={blueprintMode} themeMode={themeMode} />
          </div>
        )}

        {/* TAB 4: AGENTIC TELEMETRY & WORKFORCE ANALYTICS */}
        {activeTab === 'performance' && (
          <div className="animate-in fade-in duration-300">
            <AgentDirectory floors={floors} blueprintMode={blueprintMode} themeMode={themeMode} />
          </div>
        )}

        {/* TAB 5: GROUND STATE TELEMETRY BUS */}
        {activeTab === 'terminal' && (
          <div className="animate-in fade-in duration-300">
            <LiveEventStream shiftActive={shiftActive} blueprintMode={blueprintMode} themeMode={themeMode} />
          </div>
        )}

      </main>

      {/* 4. FLOOR INSPECTOR SLIDE-OVER DRAWER */}
      {isInspectorOpen && (
        <FloorInspectorModal
          floor={selectedFloor}
          onClose={() => setIsInspectorOpen(false)}
          blueprintMode={blueprintMode}
          shiftActive={shiftActive}
          themeMode={themeMode}
        />
      )}

      {/* 5. MARKET SHOCK & STRESS TEST SIMULATOR MODAL */}
      <MarketShockSimulator
        isOpen={isShockModalOpen}
        onClose={() => setIsShockModalOpen(false)}
        onExecuteShock={handleExecuteShock}
        blueprintMode={blueprintMode}
        themeMode={themeMode}
      />

      {/* 6. REAL-TIME REDIS / KAFKA PACKET TELEMETRY DRAWER */}
      <TelemetryDrawer
        isOpen={isTelemetryDrawerOpen}
        onToggle={() => setIsTelemetryDrawerOpen(false)}
        blueprintMode={blueprintMode}
        themeMode={themeMode}
        selectedFloorId={selectedFloorId}
        liveMessages={messages}
        isConnected={isConnected}
      />

      {/* FOOTER CREDENTIALS */}
      <footer className={`mt-auto border-t transition-colors ${
        blueprintMode 
          ? 'border-cyan-500/20 bg-black text-slate-500' 
          : themeMode === 'light'
          ? 'border-slate-200 bg-white text-slate-600'
          : 'border-slate-800/80 bg-[#030508] text-slate-500'
      } px-6 sm:px-8 py-5 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-3 font-mono`}>
        <div className="flex items-center gap-3">
          <span className={`font-semibold tracking-wider ${
            themeMode === 'light' && !blueprintMode ? 'text-slate-900' : 'text-white'
          }`}>ACE & COMPANY SYSTEMS</span>
          <span className={themeMode === 'light' && !blueprintMode ? 'text-slate-300' : 'text-slate-600'}>•</span>
          <span>Autonomous Multi-Agent Quantitative Asset Management Core</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px]">
          <span className="text-emerald-500 font-bold">BUILD: v2.4.0-STABLE</span>
          <span className={themeMode === 'light' && !blueprintMode ? 'text-slate-300' : 'text-slate-700'}>•</span>
          <span className={`flex items-center gap-1.5 ${
            themeMode === 'light' && !blueprintMode ? 'text-slate-600' : 'text-slate-400'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SECURE WS: CONNECTED
          </span>
          <span className={themeMode === 'light' && !blueprintMode ? 'text-slate-300' : 'text-slate-700'}>•</span>
          <span className={`font-semibold flex items-center gap-1 ${isConnected ? 'text-emerald-500' : 'text-rose-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            SECURE WS: {isConnected ? 'CONNECTED' : 'OFFLINE'}
          </span>
          <span className={themeMode === 'light' && !blueprintMode ? 'text-slate-300' : 'text-slate-700'}>•</span>
          <span className={themeMode === 'light' && !blueprintMode ? 'text-slate-500' : 'text-slate-500'}>© 2026 ACE & COMPANY HOLDINGS LLC</span>
        </div>
      </footer>

    </div>
  );
}
