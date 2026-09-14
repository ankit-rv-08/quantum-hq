import React, { useState } from 'react';
import { 
  Award, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Terminal, 
  FileCode2, 
  TrendingUp, 
  UserCheck,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Coffee,
  HeartPulse,
  Sliders,
  Check,
  Flame,
  Scale
} from 'lucide-react';
import { Agent, FloorData } from '../types';
import { soundFx } from '../utils/audio';

interface AgentDirectoryProps {
  floors: FloorData[];
  blueprintMode: boolean;
  themeMode?: 'dark' | 'light';
}

export const AgentDirectory: React.FC<AgentDirectoryProps> = ({ floors, blueprintMode, themeMode = 'dark' }) => {
  // Collect all agents from all floors
  const allAgents = floors.flatMap((f) => f.agents);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(allAgents[0]?.id || 'cio_alpha');
  const [selectedAgent, setSelectedAgent] = useState<Agent>(allAgents[0]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Per-agent simulated drift & wellness state
  const [agentWellnessState, setAgentWellnessState] = useState<Record<string, {
    hoursBilled: number;
    driftRiskScore: number; // 0 - 100
    driftLevel: 'OPTIMAL' | 'NOMINAL' | 'FATIGUE_WARNING';
    temperatureVariance: number;
    contextCacheUsage: number; // %
    lastAuditTimestamp: string;
    citations: number;
  }>>({
    cio_alpha: {
      hoursBilled: 9.5,
      driftRiskScore: 12,
      driftLevel: 'OPTIMAL',
      temperatureVariance: 0.08,
      contextCacheUsage: 34,
      lastAuditTimestamp: 'Today 14:00 EST',
      citations: 18,
    },
    lead_risk_chair: {
      hoursBilled: 9.2,
      driftRiskScore: 18,
      driftLevel: 'NOMINAL',
      temperatureVariance: 0.11,
      contextCacheUsage: 48,
      lastAuditTimestamp: 'Today 13:45 EST',
      citations: 14,
    },
    shareholder_proxy: {
      hoursBilled: 8.8,
      driftRiskScore: 15,
      driftLevel: 'OPTIMAL',
      temperatureVariance: 0.09,
      contextCacheUsage: 29,
      lastAuditTimestamp: 'Today 12:30 EST',
      citations: 12,
    },
    cro_sentinel: {
      hoursBilled: 9.8,
      driftRiskScore: 24,
      driftLevel: 'NOMINAL',
      temperatureVariance: 0.14,
      contextCacheUsage: 62,
      lastAuditTimestamp: 'Today 14:15 EST',
      citations: 22,
    },
    liquidity_auditor: {
      hoursBilled: 7.4,
      driftRiskScore: 8,
      driftLevel: 'OPTIMAL',
      temperatureVariance: 0.04,
      contextCacheUsage: 21,
      lastAuditTimestamp: 'Today 11:00 EST',
      citations: 9,
    },
    sec_auditor_kratos: {
      hoursBilled: 8.9,
      driftRiskScore: 14,
      driftLevel: 'OPTIMAL',
      temperatureVariance: 0.07,
      contextCacheUsage: 41,
      lastAuditTimestamp: 'Today 13:10 EST',
      citations: 16,
    },
    macro_strategist: {
      hoursBilled: 7.9,
      driftRiskScore: 16,
      driftLevel: 'OPTIMAL',
      temperatureVariance: 0.10,
      contextCacheUsage: 38,
      lastAuditTimestamp: 'Today 10:45 EST',
      citations: 11,
    },
    quant_alpha_bot: {
      hoursBilled: 9.9,
      driftRiskScore: 28,
      driftLevel: 'NOMINAL',
      temperatureVariance: 0.15,
      contextCacheUsage: 71,
      lastAuditTimestamp: 'Today 14:20 EST',
      citations: 26,
    },
    vector_backtest: {
      hoursBilled: 8.5,
      driftRiskScore: 11,
      driftLevel: 'OPTIMAL',
      temperatureVariance: 0.05,
      contextCacheUsage: 25,
      lastAuditTimestamp: 'Today 12:00 EST',
      citations: 15,
    },
    state_bus_orchestrator: {
      hoursBilled: 10.0,
      driftRiskScore: 19,
      driftLevel: 'NOMINAL',
      temperatureVariance: 0.02,
      contextCacheUsage: 55,
      lastAuditTimestamp: 'Today 14:30 EST',
      citations: 31,
    },
  });

  const handleSelectAgent = (ag: Agent) => {
    soundFx.playClick(1300);
    setSelectedAgent(ag);
    setSelectedAgentId(ag.id);
  };

  const wellness = agentWellnessState[selectedAgent.id] || {
    hoursBilled: 8.5,
    driftRiskScore: 15,
    driftLevel: 'OPTIMAL',
    temperatureVariance: 0.08,
    contextCacheUsage: 35,
    lastAuditTimestamp: 'Today 13:00 EST',
    citations: 10,
  };

  // HR Interventions
  const triggerRecalibration = () => {
    soundFx.playClick(1700);
    setAgentWellnessState((prev) => ({
      ...prev,
      [selectedAgent.id]: {
        ...wellness,
        driftRiskScore: Math.max(5, wellness.driftRiskScore - 12),
        driftLevel: 'OPTIMAL',
        contextCacheUsage: Math.max(10, wellness.contextCacheUsage - 25),
        lastAuditTimestamp: 'Just Now (Recalibrated)',
      },
    }));
    setActionNotice(`Context Cache Flushed & Soft Attention Weights Recalibrated for ${selectedAgent.name}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const issueCommendation = () => {
    soundFx.playGavel();
    setAgentWellnessState((prev) => ({
      ...prev,
      [selectedAgent.id]: {
        ...wellness,
        citations: wellness.citations + 1,
      },
    }));
    setActionNotice(`Zero-Hallucination Disciplinary Commendation issued to ${selectedAgent.name}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const getDriftBadge = (level: string) => {
    switch (level) {
      case 'OPTIMAL':
        return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40';
      case 'NOMINAL':
        return 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/40';
    }
  };

  const isLight = themeMode === 'light' && !blueprintMode;

  return (
    <div id="agent-directory-hr-view" className="space-y-8 max-w-7xl mx-auto">
      
      {/* Banner */}
      <div className={`p-6 rounded-3xl border backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl transition-colors ${
        blueprintMode
          ? 'bg-cyan-950/30 border-cyan-500/30'
          : isLight
          ? 'bg-white/95 border-slate-200/90 shadow-sm'
          : 'bg-slate-950/80 border-slate-800/80'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 mb-1">
            <HeartPulse className="w-4 h-4 text-emerald-500" />
            <span>AI HUMAN RESOURCES & MODEL DRIFT AUDIT SUITE</span>
          </div>
          <h2 className={`text-2xl font-bold font-['Cinzel',serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
            HR Department & Agent Wellness Suite
          </h2>
          <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Monitor autonomous employee operational metrics, token fatigue indices, capped 10h trading shifts, and empirical model drift to ensure zero-hallucination execution across all floors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2.5 rounded-2xl border text-center ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-slate-800'
          }`}>
            <span className={`text-[10px] uppercase font-mono block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Audited Agents
            </span>
            <span className="text-base font-bold text-emerald-500 dark:text-emerald-400 font-mono">{allAgents.length} Full-Time</span>
          </div>
          <div className={`px-4 py-2.5 rounded-2xl border text-center ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-slate-800'
          }`}>
            <span className={`text-[10px] uppercase font-mono block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Max Shift Cap
            </span>
            <span className="text-base font-bold text-amber-500 dark:text-amber-400 font-mono">10.0h Limit</span>
          </div>
          <div className={`px-4 py-2.5 rounded-2xl border text-center ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-slate-800'
          }`}>
            <span className={`text-[10px] uppercase font-mono block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Firm Hallucination Rate
            </span>
            <span className="text-base font-bold text-cyan-500 dark:text-cyan-400 font-mono">0.00% Zero</span>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono px-5 py-2.5 rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Grid: Left Roster List (4 cols) & Right Detailed Wellness Dossier (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Agent Selection List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className={`text-xs uppercase font-bold tracking-wider font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Autonomous Employee Roster
            </span>
            <span className="text-[11px] font-mono text-emerald-500 dark:text-emerald-400 font-semibold">All Nodes Verified</span>
          </div>

          <div className="space-y-2 max-h-[660px] overflow-y-auto pr-1">
            {allAgents.map((ag) => {
              const isSelected = selectedAgent.id === ag.id;
              const agWellness = agentWellnessState[ag.id] || {
                hoursBilled: 8.5,
                driftRiskScore: 12,
                driftLevel: 'OPTIMAL',
              };

              return (
                <div
                  key={ag.id}
                  onClick={() => handleSelectAgent(ag)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-md scale-[1.01]'
                        : 'bg-slate-900 border-emerald-400 shadow-xl scale-[1.01]'
                      : isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                      : 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs ${
                        isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
                      }`}>
                        {ag.name.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          <span>{ag.name.replace(/_/g, ' ')}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </h4>
                        <p className={`text-[10px] truncate max-w-[140px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {ag.title}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                      isLight ? 'bg-slate-100 text-emerald-700 border-slate-200' : 'bg-black/40 text-emerald-300 border-white/5'
                    }`}>
                      F{ag.floorId}
                    </span>
                  </div>

                  {/* Shift Progress Bar in Card */}
                  <div className={`space-y-1 pt-1 border-t mt-1 ${isLight ? 'border-slate-100' : 'border-slate-800/60'}`}>
                    <div className={`flex items-center justify-between text-[9px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span>Shift: {agWellness.hoursBilled.toFixed(1)}h / 10h</span>
                      <span className={agWellness.driftLevel === 'OPTIMAL' ? 'text-emerald-500 font-semibold' : 'text-amber-500 font-semibold'}>
                        {agWellness.driftLevel}
                      </span>
                    </div>
                    <div className={`w-full h-1 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                      <div 
                        className={`h-full rounded-full ${agWellness.hoursBilled >= 9.5 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                        style={{ width: `${(agWellness.hoursBilled / 10.0) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Selected Agent HR & Wellness Dossier */}
        <div className="lg:col-span-8 space-y-6">
          <div className={`p-8 rounded-3xl border backdrop-blur-2xl shadow-2xl space-y-6 transition-colors ${
            blueprintMode
              ? 'bg-cyan-950/30 border-cyan-500/30'
              : isLight
              ? 'bg-white/95 border-slate-200/90 shadow-xl'
              : 'bg-slate-950/80 border-slate-800/80'
          }`}>
            
            {/* Dossier Header */}
            <div className={`flex flex-wrap items-start justify-between gap-4 pb-6 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center font-bold text-2xl shadow-xl ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-gradient-to-br from-emerald-500/20 via-slate-800 to-black border-emerald-500/30 text-emerald-300'
                }`}>
                  {selectedAgent.name.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${getDriftBadge(wellness.driftLevel)}`}>
                      DRIFT STATUS: {wellness.driftLevel} ({wellness.driftRiskScore}% Risk)
                    </span>
                    <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      Floor {selectedAgent.floorId} • {selectedAgent.metrics.department}
                    </span>
                  </div>
                  <h3 className={`text-2xl font-bold font-['Cinzel',serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {selectedAgent.name.replace(/_/g, ' ')}
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{selectedAgent.title}</p>
                </div>
              </div>

              {/* Interventions Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerRecalibration}
                  className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-1.5 transition font-mono ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
                  }`}
                  title="Flush intermediate scratchpad and recalibrate temperature"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Recalibrate</span>
                </button>
                <button
                  onClick={issueCommendation}
                  className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-xs text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5 transition font-mono font-bold"
                  title="Issue zero-hallucination compliance citation"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Commend</span>
                </button>
              </div>
            </div>

            {/* 10-Hour Shift Limit & Burnout Analytics Module */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Trading Shift Fatigue & 10h Cap Enforced</span>
                </span>
                <span className="text-xs font-mono text-amber-600 dark:text-amber-300 font-bold">
                  {wellness.hoursBilled.toFixed(1)}h / 10.0h ({((wellness.hoursBilled / 10) * 100).toFixed(0)}% Shift Load)
                </span>
              </div>

              {/* Progress bar */}
              <div className={`w-full h-3 rounded-full p-0.5 border overflow-hidden ${
                isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-slate-800'
              }`}>
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    wellness.hoursBilled >= 9.5 
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, (wellness.hoursBilled / 10.0) * 100)}%` }}
                />
              </div>

              <div className={`flex items-center justify-between text-[11px] font-mono pt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>Shift Policy: Mandated 10h max limit before mandatory context reset.</span>
                <span className="text-emerald-500 font-semibold">
                  {10 - wellness.hoursBilled > 0 
                    ? `${(10 - wellness.hoursBilled).toFixed(1)}h Remaining` 
                    : 'Shift Limit Reached'}
                </span>
              </div>
            </div>

            {/* 4 Core HR KPI Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Tile 1: Accuracy & Zero Hallucination */}
              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'}`}>
                <span className={`text-[10px] uppercase font-mono flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Accuracy Rating
                </span>
                <p className={`text-xl font-bold font-mono mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedAgent.metrics.accuracyScore}
                </p>
                <span className="text-[10px] text-emerald-500 font-mono font-semibold">0.00% Hallucinations</span>
              </div>

              {/* Tile 2: Token Inference Efficiency */}
              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'}`}>
                <span className={`text-[10px] uppercase font-mono flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Activity className="w-3.5 h-3.5 text-cyan-500" /> Tokens Processed
                </span>
                <p className={`text-xl font-bold font-mono mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedAgent.metrics.tokensProcessed}
                </p>
                <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Sub-10ms Inference</span>
              </div>

              {/* Tile 3: Temperature Variance / Drift */}
              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'}`}>
                <span className={`text-[10px] uppercase font-mono flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Sliders className="w-3.5 h-3.5 text-amber-500" /> Temperature Drift
                </span>
                <p className="text-xl font-bold text-amber-500 dark:text-amber-300 font-mono mt-1">+{wellness.temperatureVariance}</p>
                <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Within ±0.20 Target</span>
              </div>

              {/* Tile 4: Disciplinary Citations */}
              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'}`}>
                <span className={`text-[10px] uppercase font-mono flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Award className="w-3.5 h-3.5 text-violet-500" /> Commendations
                </span>
                <p className="text-xl font-bold text-violet-600 dark:text-violet-300 font-mono mt-1">{wellness.citations}</p>
                <span className="text-[10px] text-emerald-500 font-mono font-semibold">Zero Violations</span>
              </div>

            </div>

            {/* Architectural & Training Specifications */}
            <div className="space-y-4 pt-2">
              <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-slate-800'}`}>
                <h4 className={`text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 font-mono ${
                  isLight ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  <Cpu className="w-3.5 h-3.5 text-indigo-500" /> Computational Engine & Model Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary LLM:</span>
                    <span className={`font-mono font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedAgent.model}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Engine Framework:</span>
                    <span className="font-mono text-emerald-500 dark:text-emerald-400 font-semibold">{selectedAgent.metrics.engine}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Department:</span>
                    <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>{selectedAgent.metrics.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Registered Active Tool:</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 truncate block">{selectedAgent.activeTool}</span>
                  </div>
                </div>
              </div>

              {/* Training Records & Disciplinary History */}
              <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-slate-800'}`}>
                <h4 className={`text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 font-mono ${
                  isLight ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  <UserCheck className="w-3.5 h-3.5 text-amber-500" /> Personnel Training Record & Promotion History
                </h4>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {selectedAgent.metrics.history}
                </p>
                <div className={`pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                  isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800/80 text-slate-500'
                }`}>
                  <span>Weight Checkpoint: sha256:7f8a91c0e3b4d8...</span>
                  <span className="text-emerald-500 font-semibold">Last Audit: {wellness.lastAuditTimestamp}</span>
                </div>
              </div>

              {/* Current Live Workstream */}
              <div className={`p-4 rounded-2xl border space-y-1.5 ${
                isLight ? 'bg-emerald-50/70 border-emerald-200 text-slate-800' : 'bg-emerald-950/20 border-emerald-500/30'
              }`}>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Active Executive Workstream
                </span>
                <p className={`text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {selectedAgent.currentTask}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
