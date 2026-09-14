import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Terminal, 
  Activity, 
  Radio, 
  Users, 
  Cpu, 
  Layers, 
  Play, 
  Pause, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight,
  TrendingUp,
  Clock,
  Zap,
  Code
} from 'lucide-react';
import { FloorData, Agent, DebateMessage } from '../types';
import { soundFx } from '../utils/audio';

interface FloorInspectorModalProps {
  floor: FloorData | null;
  onClose: () => void;
  blueprintMode: boolean;
  shiftActive: boolean;
  themeMode?: 'dark' | 'light';
}

export const FloorInspectorModal: React.FC<FloorInspectorModalProps> = ({
  floor,
  onClose,
  blueprintMode,
  shiftActive,
  themeMode = 'dark',
}) => {
  if (!floor) return null;

  const [selectedAgent, setSelectedAgent] = useState<Agent>(floor.agents[0]);
  const [tokenLogs, setTokenLogs] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(1);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [debateList, setDebateList] = useState<DebateMessage[]>(floor.debateLogs);
  const [activeTab, setActiveTab] = useState<'agents' | 'terminal' | 'debate'>('agents');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Update selected agent if floor changes
  useEffect(() => {
    if (floor.agents.length > 0) {
      setSelectedAgent(floor.agents[0]);
    }
    setDebateList(floor.debateLogs);
  }, [floor]);

  // Simulated live token stream and thought log
  useEffect(() => {
    if (!isStreaming || !shiftActive) return;

    const thoughtTemplates = [
      `[THOUGHT] ${selectedAgent.name} // Evaluating parameters for ${selectedAgent.currentTask.slice(0, 45)}...`,
      `[AST_ENGINE] Validated covariance matrix with eigenvalues λ1=2.84, λ2=1.12. Zero look-ahead bias confirmed.`,
      `[TOOL_CALL] ${selectedAgent.activeTool}`,
      `[INFERENCE] Generated 1,024 reasoning tokens with temperature=0.15. Cross-entropy loss: 0.042.`,
      `[STATE_SYNC] Broadcasting updated factor score to Ground Floor Redis bus (partition #3).`,
      `[AUDIT_CHECK] ASC 606 revenue recognition criteria satisfied. No off-balance-sheet footnotes triggered.`,
      `[PORTFOLIO_DELTA] Recommended risk weight: +0.85% under 99% VaR ceiling.`,
      `[CONSENSUS] Synchronizing with Executive Board Room (Floor 4) quorum.`,
    ];

    // Seed initial tokens if empty
    if (tokenLogs.length === 0) {
      setTokenLogs([
        `[INIT] Agent ${selectedAgent.name} running on ${selectedAgent.model}`,
        `[STATUS] Current task: ${selectedAgent.currentTask}`,
        `[HEARTBEAT] Memory footprint: 4.2GB | GPU Metal Allocation: 82%`,
      ]);
    }

    const intervalTime = Math.max(1200 / streamSpeed, 350);
    const interval = setInterval(() => {
      const randomLine = thoughtTemplates[Math.floor(Math.random() * thoughtTemplates.length)];
      const timestamp = new Date().toTimeString().split(' ')[0];
      setTokenLogs((prev) => [...prev.slice(-35), `[${timestamp}] ${randomLine}`]);
      soundFx.playClick(1700, 0.015);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isStreaming, shiftActive, streamSpeed, selectedAgent, tokenLogs.length]);

  // Scroll terminal to bottom
  useEffect(() => {
    if (activeTab === 'terminal' && terminalEndRef.current) {
      terminalEndRef.current.scrollTop = terminalEndRef.current.scrollHeight;
    }
  }, [tokenLogs, activeTab]);

  // User manual prompt injection into agent swarm
  const handleInjectPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    soundFx.playClick(2000);
    const time = new Date().toTimeString().split(' ')[0];
    const userPrompt = customPrompt.trim();
    setCustomPrompt('');

    // Add to terminal
    setTokenLogs((prev) => [
      ...prev,
      `[${time}] [EXECUTIVE_INTERVENTION] >>> "${userPrompt}"`,
      `[${time}] [THINKING] ${selectedAgent.name} parsing executive directive into sub-tasks...`,
      `[${time}] [TOOL_EXECUTION] dispatch_synthetic_audit(query="${userPrompt}")`,
      `[${time}] [RESPONSE] Directive accepted: recalculating risk bounds and logging to board agenda.`,
    ]);

    // Add message to debate list
    const newDebate: DebateMessage = {
      id: `user-d-${Date.now()}`,
      speakerId: 'executive_user',
      speakerName: 'Executive Director (Human)',
      speakerRole: 'Boardroom Overseer',
      floorId: floor.id,
      timestamp: time,
      message: `Directive issued: "${userPrompt}". All agents proceed with priority execution.`,
      voteStance: 'NEUTRAL',
    };

    setDebateList((prev) => [...prev, newDebate]);
    setActiveTab('terminal');
  };

  // Trigger simulated debate
  const handleTriggerDebate = () => {
    soundFx.playClick(1400);
    const time = new Date().toTimeString().split(' ')[0];
    const newMsg: DebateMessage = {
      id: `deb-${Date.now()}`,
      speakerId: selectedAgent.id,
      speakerName: selectedAgent.name,
      speakerRole: selectedAgent.title,
      floorId: floor.id,
      timestamp: time,
      message: `Cross-examining real-time telemetry: High correlation with semiconductor beta indicates risk margin is within bounds. Requesting floor vote.`,
      voteStance: 'BULLISH',
    };
    setDebateList((prev) => [...prev, newMsg]);
    setActiveTab('debate');
  };

  const isLight = themeMode === 'light' && !blueprintMode;

  return (
    <div 
      id="floor-inspector-overlay"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        id="floor-inspector-drawer"
        className={`w-full max-w-2xl h-full flex flex-col shadow-2xl border-l overflow-hidden transition-all duration-300 ${
          blueprintMode 
            ? 'bg-[#040814] border-cyan-500/30 text-slate-100' 
            : isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
            : 'bg-[#07090f] border-slate-800 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className={`px-6 py-5 border-b flex items-start justify-between backdrop-blur-md transition-colors ${
          isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-black/40 border-slate-800/80'
        }`}>
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg border shadow-lg"
              style={{
                borderColor: floor.accentColor,
                color: floor.accentColor,
                backgroundColor: `${floor.accentColor}18`,
              }}
            >
              F{floor.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-500 font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  <Radio className="w-3.5 h-3.5 animate-spin" /> Floor Inspector
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  floor.status === 'IN_SESSION'
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                }`}>
                  {floor.status}
                </span>
              </div>
              <h2 className={`text-xl font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{floor.name}</h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{floor.department}</p>
            </div>
          </div>

          <button 
            onClick={() => {
              soundFx.playClick(1000);
              onClose();
            }}
            className={`p-2 rounded-xl border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-slate-900'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Close Floor Inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floor KPI Metric Badges */}
        <div className={`px-6 py-3 border-b grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs transition-colors ${
          isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-black/30 border-slate-800/60'
        }`}>
          {floor.metrics.map((m, idx) => (
            <div key={idx} className={`p-2 rounded-lg border ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900/40 border-slate-800/80'
            }`}>
              <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{m.label}</span>
              <span className={`font-bold font-mono font-mono-numbers mt-0.5 block ${isLight ? 'text-slate-900' : 'text-white'}`}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className={`px-6 pt-3 flex gap-2 border-b transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'border-slate-800/60 bg-black/20'
        }`}>
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'agents'
                ? isLight
                  ? 'border-emerald-500 text-emerald-700 bg-white shadow-sm'
                  : 'border-emerald-400 text-emerald-300 bg-slate-900/50'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Department Agents ({floor.agents.length})
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'terminal'
                ? isLight
                  ? 'border-emerald-500 text-emerald-700 bg-white shadow-sm'
                  : 'border-emerald-400 text-emerald-300 bg-slate-900/50'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-500" /> Live Token Stream & LLM Reasoning
          </button>
          <button
            onClick={() => setActiveTab('debate')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'debate'
                ? isLight
                  ? 'border-emerald-500 text-emerald-700 bg-white shadow-sm'
                  : 'border-emerald-400 text-emerald-300 bg-slate-900/50'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-500" /> Inter-Floor Debates ({debateList.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: AGENTS */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              
              {/* Active Tasks List */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
              }`}>
                <h4 className={`text-xs uppercase tracking-wider flex items-center gap-1.5 font-bold ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Live Floor Workstream Queue
                </h4>
                <div className="space-y-1.5">
                  {floor.activeTasks.map((t, idx) => (
                    <div key={idx} className={`flex items-start gap-2 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      <span className="text-emerald-500 font-mono">▶</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Cards */}
              <div className="space-y-3">
                <h4 className={`text-xs uppercase tracking-wider flex items-center justify-between font-bold ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  <span>Autonomous Employee Agents</span>
                  <span className="text-[10px] text-emerald-500 font-mono font-bold">Quorum Active</span>
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {floor.agents.map((ag) => {
                    const isSelected = selectedAgent.id === ag.id;
                    return (
                      <div
                        key={ag.id}
                        onClick={() => {
                          soundFx.playClick(1300);
                          setSelectedAgent(ag);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? isLight
                              ? 'bg-emerald-50/70 border-emerald-500 shadow-md scale-[1.01]'
                              : 'bg-slate-900/90 border-emerald-400/80 shadow-[0_0_16px_rgba(16,185,129,0.15)] scale-[1.01]'
                            : isLight
                            ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                            : 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center font-bold text-white text-sm shadow-inner">
                              {ag.name.slice(0, 2)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{ag.name}</h3>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              </div>
                              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{ag.title}</p>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 font-bold">
                            {ag.efficiency} Efficiency
                          </span>
                        </div>

                        {/* Current Task & Active Tool */}
                        <div className={`mt-3 p-2.5 rounded-xl border space-y-1.5 text-xs ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'
                        }`}>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Current Task:</span>
                            <span className="text-emerald-500 font-mono">{ag.currentState}</span>
                          </div>
                          <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{ag.currentTask}</p>

                          <div className={`flex items-center gap-1.5 pt-1.5 border-t text-[10px] font-mono text-cyan-500 ${
                            isLight ? 'border-slate-200' : 'border-slate-800/80'
                          }`}>
                            <Code className="w-3 h-3 text-cyan-500" />
                            <span>Tool: {ag.activeTool}</span>
                          </div>
                        </div>

                        {/* Agent Quick Metrics */}
                        <div className={`mt-3 flex items-center justify-between text-[11px] border-t pt-2 ${
                          isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800/60 text-slate-400'
                        }`}>
                          <span>Hours Today: <strong className={`font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{ag.metrics.hoursBilledToday}</strong></span>
                          <span>Tokens: <strong className={`font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{ag.metrics.tokensProcessed}</strong></span>
                          <span>Engine: <strong className="text-emerald-500 font-mono">{ag.model}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: LIVE TOKEN STREAM & LLM REASONING TERMINAL */}
          {activeTab === 'terminal' && (
            <div className="space-y-4">
              
              {/* Terminal Header Controls */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    <span>LLM TOKEN BUS // {selectedAgent.name}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsStreaming(!isStreaming)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1 border ${
                      isStreaming
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {isStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {isStreaming ? 'Pause' : 'Stream'}
                  </button>

                  <select
                    value={streamSpeed}
                    onChange={(e) => setStreamSpeed(Number(e.target.value))}
                    className="bg-black border border-slate-700 text-slate-200 text-[11px] font-mono px-2 py-1 rounded"
                  >
                    <option value={1}>1x Speed</option>
                    <option value={2}>2x Speed</option>
                    <option value={4}>4x Speed</option>
                  </select>
                </div>
              </div>

              {/* Terminal Viewport */}
              <div 
                ref={terminalEndRef}
                className="h-80 overflow-y-auto p-4 rounded-2xl bg-[#030408] border border-emerald-500/20 font-mono text-xs space-y-1.5 shadow-inner select-text"
              >
                <div className="text-slate-500 text-[10px] pb-2 border-b border-slate-900 flex items-center justify-between">
                  <span>Model: {selectedAgent.model}</span>
                  <span>Temperature: 0.15 | Streaming: Active</span>
                </div>

                {tokenLogs.map((log, index) => {
                  let color = 'text-slate-300';
                  if (log.includes('[TOOL_CALL]')) color = 'text-cyan-400 font-bold';
                  if (log.includes('[THOUGHT]')) color = 'text-amber-300';
                  if (log.includes('[EXECUTIVE_INTERVENTION]')) color = 'text-emerald-400 font-bold bg-emerald-950/30 p-1 rounded';
                  if (log.includes('[RESULT]') || log.includes('[AST_ENGINE]')) color = 'text-emerald-300';

                  return (
                    <div key={index} className={`leading-relaxed text-[11px] ${color}`}>
                      {log}
                    </div>
                  );
                })}
              </div>

              {/* Intervene / Inject Prompt into Swarm */}
              <form onSubmit={handleInjectPrompt} className="flex gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={`Inject directive to ${selectedAgent.name} (e.g., Audit customer concentration in NVDA)...`}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-mono border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500'
                  }`}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch</span>
                </button>
              </form>

            </div>
          )}

          {/* TAB 3: DEBATES & TRANSCRIPTS */}
          {activeTab === 'debate' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Formal Inter-Departmental Deliberations</span>
                <button
                  onClick={handleTriggerDebate}
                  className="text-xs px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-semibold flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Simulate Floor Cross-Examination</span>
                </button>
              </div>

              <div className="space-y-3">
                {debateList.map((d) => (
                  <div 
                    key={d.id} 
                    className={`p-4 rounded-2xl border space-y-2 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{d.speakerName}</span>
                        <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>({d.speakerRole})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {d.voteStance && (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            d.voteStance === 'BULLISH'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                              : d.voteStance === 'DISSENT'
                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {d.voteStance}
                          </span>
                        )}
                        <span className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{d.timestamp}</span>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed pl-2 border-l-2 ${
                      isLight ? 'border-slate-300 text-slate-700' : 'border-slate-700 text-slate-300'
                    }`}>
                      {d.message}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
