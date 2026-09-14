import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Zap, 
  Clock, 
  Sliders,
  ShieldCheck,
  RefreshCw,
  Compass,
  Sun,
  Moon,
  Sunset,
  Cpu,
  Coins,
  Gauge
} from 'lucide-react';
import { StockTicker, FirmStatusType, ThemeMode, TimeOfDay } from '../types';
import { soundFx } from '../utils/audio';

interface TopTickerBarProps {
  stocks?: StockTicker[];
  firmStatus: FirmStatusType;
  shiftActive: boolean;
  onToggleShift: () => void;
  blueprintMode: boolean;
  onToggleBlueprint: () => void;
  onTriggerStressTest: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
  timeOfDay?: TimeOfDay;
  onChangeTimeOfDay?: (time: TimeOfDay) => void;
}

export const TopTickerBar: React.FC<TopTickerBarProps> = ({
  stocks,
  firmStatus,
  shiftActive,
  onToggleShift,
  blueprintMode,
  onToggleBlueprint,
  onTriggerStressTest,
  isMuted,
  onToggleMute,
  themeMode = 'dark',
  onToggleTheme,
  timeOfDay = 'sunset',
  onChangeTimeOfDay,
}) => {
  const [time, setTime] = useState<string>('');
  const [nyTime, setNyTime] = useState<string>('');
  const [lonTime, setLonTime] = useState<string>('');
  const [tkyTime, setTkyTime] = useState<string>('');

  // Live Token & Latency HUD counters
  const [tokenCount, setTokenCount] = useState<number>(142890);
  const [latencyMs, setLatencyMs] = useState<number>(142);
  const [isHudOpen, setIsHudOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0]);

      // International financial hubs
      setNyTime(now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false, hour: '2-digit', minute: '2-digit' }));
      setLonTime(now.toLocaleTimeString('en-US', { timeZone: 'Europe/London', hour12: false, hour: '2-digit', minute: '2-digit' }));
      setTkyTime(now.toLocaleTimeString('en-US', { timeZone: 'Asia/Tokyo', hour12: false, hour: '2-digit', minute: '2-digit' }));
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate active agent token consumption and tool latency jitter
  useEffect(() => {
    if (!shiftActive) return;

    const interval = setInterval(() => {
      setTokenCount((prev) => prev + Math.floor(Math.random() * 45 + 15));
      setLatencyMs(138 + Math.floor(Math.random() * 11)); // 138ms - 149ms
    }, 2800);

    return () => clearInterval(interval);
  }, [shiftActive]);

  const costToday = (tokenCount * 0.00000305).toFixed(3);

  const getStatusLabel = () => {
    if (!shiftActive) return 'Shift: Standby (Compute Preserved)';
    switch (firmStatus) {
      case 'PRE_MARKET_INGESTION':
        return 'Shift: Active - Pre-Market Ingestion';
      case 'ACTIVE_SHIFT':
        return 'Shift: Active - Core Market Trading';
      case 'POST_MARKET_REVIEW':
        return 'Shift: Post-Market Board Review';
      default:
        return 'Shift: Active - Real-Time Ingestion';
    }
  };

  return (
    <header 
      id="quantum-top-rooftop-feed"
      className={`border-b transition-colors duration-300 backdrop-blur-2xl sticky top-0 z-50 ${
        blueprintMode 
          ? 'bg-[#050811]/90 border-cyan-500/20 text-cyan-400' 
          : themeMode === 'light'
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
          : 'bg-[#050508]/90 border-slate-800/80 text-slate-200'
      }`}
    >
      {/* Upper Control Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Brand & Corporate Monolith Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
              blueprintMode 
                ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                : 'bg-emerald-500/10 border-emerald-400/30 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
            }`}>
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-extrabold tracking-widest text-sm font-['Cinzel',serif] ${
                  themeMode === 'light' && !blueprintMode ? 'text-slate-950' : 'text-white'
                }`}>ACE & COMPANY</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  themeMode === 'light' && !blueprintMode ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-300'
                }`}>v4.2-CORP</span>
              </div>
              <p className={`text-[10px] ${themeMode === 'light' && !blueprintMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Autonomous Asset Management Monolith
              </p>
            </div>
          </div>

          <div className={`h-5 w-[1px] hidden md:block ${themeMode === 'light' && !blueprintMode ? 'bg-slate-200' : 'bg-slate-800'}`} />

          {/* Global Firm Status Indicator */}
          <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all ${
            shiftActive 
              ? blueprintMode 
                ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300' 
                : themeMode === 'light'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : themeMode === 'light'
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
          }`}>
            <span className="relative flex h-2 w-2">
              {shiftActive && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  blueprintMode ? 'bg-cyan-400' : 'bg-emerald-400'
                }`} />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                shiftActive ? (blueprintMode ? 'bg-cyan-400' : 'bg-emerald-500') : 'bg-amber-500'
              }`} />
            </span>
            <span className="font-semibold text-[11px] font-mono tracking-tight">{getStatusLabel()}</span>
          </div>

          {/* Live Token Cost & Latency HUD Pill */}
          <div className="relative">
            <button
              onClick={() => {
                soundFx.playClick(1700);
                setIsHudOpen(!isHudOpen);
              }}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-full border font-mono text-[10px] transition-all ${
                blueprintMode
                  ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300'
                  : themeMode === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-black/60 hover:bg-white/5 border-white/10 text-slate-300'
              }`}
              title="Token Consumption & Tool Latency HUD"
            >
              <Coins className="w-3 h-3 text-amber-400" />
              <span className="font-semibold">{tokenCount.toLocaleString()} tok</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">${costToday}</span>
              <span className="hidden xl:inline text-slate-500">•</span>
              <span className="hidden xl:flex items-center gap-1 text-slate-400">
                <Gauge className="w-2.5 h-2.5 text-cyan-400" />
                <span>{latencyMs}ms avg</span>
              </span>
            </button>

            {/* Expanded Telemetry HUD Tooltip / Card */}
            {isHudOpen && (
              <div 
                className={`absolute left-0 top-full mt-2 w-64 p-3 rounded-2xl border shadow-2xl z-50 backdrop-blur-2xl font-mono text-xs animate-in fade-in slide-in-from-top-1 ${
                  blueprintMode
                    ? 'bg-[#030716]/95 border-cyan-500/40 text-cyan-300'
                    : themeMode === 'light'
                    ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
                    : 'bg-[#060813]/95 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10 font-bold text-[11px] text-amber-400">
                  <span>LANGGRAPH COMPUTE HUD</span>
                  <span className="text-emerald-400">ONLINE</span>
                </div>
                <div className="space-y-1.5 pt-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Today's Token Volume:</span>
                    <span className="font-bold">{tokenCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated API Spend:</span>
                    <span className="text-emerald-400 font-bold">${costToday} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Tool Execution Latency:</span>
                    <span className="text-cyan-400 font-bold">{latencyMs}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Redis IPC Ping:</span>
                    <span className="font-bold">0.24ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Semantic Cache Hit Rate:</span>
                    <span className="text-amber-400 font-bold">94.2%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Hub Clocks */}
        <div className={`hidden lg:flex items-center gap-4 text-[11px] font-mono px-3 py-1 rounded-lg border ${
          themeMode === 'light' && !blueprintMode
            ? 'bg-slate-100 text-slate-600 border-slate-200'
            : 'bg-black/40 text-slate-400 border-white/5'
        }`}>
          <div className="flex items-center gap-1">
            <span className={themeMode === 'light' && !blueprintMode ? 'text-slate-400' : 'text-slate-500'}>NYC</span>
            <span className={themeMode === 'light' && !blueprintMode ? 'text-slate-800 font-semibold' : 'text-slate-200'}>{nyTime}</span>
          </div>
          <span className={themeMode === 'light' && !blueprintMode ? 'text-slate-300' : 'text-slate-700'}>|</span>
          <div className="flex items-center gap-1">
            <span className={themeMode === 'light' && !blueprintMode ? 'text-slate-400' : 'text-slate-500'}>LON</span>
            <span className={themeMode === 'light' && !blueprintMode ? 'text-slate-800 font-semibold' : 'text-slate-200'}>{lonTime}</span>
          </div>
          <span className={themeMode === 'light' && !blueprintMode ? 'text-slate-300' : 'text-slate-700'}>|</span>
          <div className="flex items-center gap-1">
            <span className={themeMode === 'light' && !blueprintMode ? 'text-slate-400' : 'text-slate-500'}>TYO</span>
            <span className={themeMode === 'light' && !blueprintMode ? 'text-slate-800 font-semibold' : 'text-slate-200'}>{tkyTime}</span>
          </div>
          <span className={themeMode === 'light' && !blueprintMode ? 'text-slate-300' : 'text-slate-700'}>|</span>
          <div className="flex items-center gap-1.5 text-emerald-500" title="Chief of Staff scheduler heartbeat">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CHIEF OF STAFF: CRON ACTIVE (10s)</span>
          </div>
        </div>

        {/* Global Firm Quick Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Dynamic Lighting / Time-of-Day Segmented Switcher */}
          {!blueprintMode && onChangeTimeOfDay && (
            <div className={`flex items-center p-0.5 rounded-lg border ${
              themeMode === 'light'
                ? 'bg-slate-100 border-slate-200'
                : 'bg-black/40 border-slate-800'
            }`} title="Atmospheric Lighting: Day, Sunset (Golden Hour), Night">
              <button
                onClick={() => {
                  soundFx.playClick(1500);
                  onChangeTimeOfDay('day');
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                  timeOfDay === 'day'
                    ? themeMode === 'light'
                      ? 'bg-white text-sky-600 shadow-sm font-bold'
                      : 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Crisp Daylight & High Glass Transparency"
              >
                <Sun className="w-3 h-3 text-amber-400" />
                <span className="hidden xl:inline">Day</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick(1400);
                  onChangeTimeOfDay('sunset');
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                  timeOfDay === 'sunset'
                    ? themeMode === 'light'
                      ? 'bg-white text-amber-600 shadow-sm font-bold'
                      : 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Warm Golden-Hour Sunset & Amber Horizon"
              >
                <Sunset className="w-3 h-3 text-orange-400" />
                <span className="hidden xl:inline">Sunset</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick(1300);
                  onChangeTimeOfDay('night');
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                  timeOfDay === 'night'
                    ? themeMode === 'light'
                      ? 'bg-white text-indigo-600 shadow-sm font-bold'
                      : 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Deep Glass-Reflected Twilight Manhattan Night"
              >
                <Moon className="w-3 h-3 text-indigo-400" />
                <span className="hidden xl:inline">Night</span>
              </button>
            </div>
          )}

          {/* Light / Dark Mode Toggle */}
          {onToggleTheme && (
            <button
              id="toggle-light-dark-mode-btn"
              onClick={() => {
                soundFx.playClick(1700);
                onToggleTheme();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm ${
                themeMode === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
              title={themeMode === 'light' ? 'Switch to Dark Mode (Obsidian Luxury)' : 'Switch to Light Mode (Crystal Executive)'}
            >
              {themeMode === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden md:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Light</span>
                </>
              )}
            </button>
          )}

          {/* Pause / Resume Active Shift */}
          <button
            id="toggle-firm-shift-btn"
            onClick={() => {
              soundFx.playClick(1400);
              onToggleShift();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm ${
              shiftActive
                ? themeMode === 'light' && !blueprintMode
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-400'
            }`}
            title="Toggle autonomous LLM agent shift execution"
          >
            {shiftActive ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Pause Shift</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Resume Shift</span>
              </>
            )}
          </button>

          {/* Trigger Market Shock / Stress Test */}
          <button
            id="trigger-stress-test-btn"
            onClick={() => {
              soundFx.playShockAlert();
              onTriggerStressTest();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm ${
              themeMode === 'light' && !blueprintMode
                ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300'
            }`}
            title="Inject real-time market anomaly down Redis pipeline to test inter-floor debate"
          >
            <Zap className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="hidden sm:inline">Simulate Shock</span>
          </button>

          {/* Exterior Mode Switch: Realistic Exterior vs Blueprint Mode */}
          <button
            id="toggle-blueprint-mode-btn"
            onClick={() => {
              soundFx.playClick(1600);
              onToggleBlueprint();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              blueprintMode
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : themeMode === 'light'
                ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
            }`}
            title="Toggle between Realistic 3D Glass Exterior and Neon Blueprint Schematic"
          >
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">
              {blueprintMode ? 'Mode: Blueprint' : 'Mode: Crystal 3D'}
            </span>
            <span className="sm:hidden">
              {blueprintMode ? 'Blueprint' : 'Crystal'}
            </span>
          </button>

          {/* Audio Feedback Toggle */}
          <button
            id="toggle-audio-mute-btn"
            onClick={() => {
              onToggleMute();
              soundFx.isMuted = !isMuted;
              if (isMuted) soundFx.playClick(900);
            }}
            className={`p-1.5 rounded-lg border transition-colors ${
              isMuted 
                ? themeMode === 'light' && !blueprintMode
                  ? 'bg-slate-100 border-slate-200 text-slate-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
            }`}
            title={isMuted ? 'Unmute Bloomberg Telemetry Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

        </div>

      </div>
    </header>
  );
};
