import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Volume2, 
  VolumeX, 
  Clock, 
  FileText,
  Gavel,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';
import { FloorData, ThemeMode } from '../types';
import { soundFx } from '../utils/audio';
import { ExportMemoModal } from './ExportMemoModal';

interface BoardroomWarRoomProps {
  floors: FloorData[];
  blueprintMode: boolean;
  shiftActive: boolean;
  themeMode?: ThemeMode;
}

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  department: string;
  seat: 'north' | 'south' | 'east' | 'west';
  avatarInitials: string;
  model: string;
  stance: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'DISSENT';
  accentColor: string;
  currentInternalThought: string;
  burnoutStatus: 'OPTIMAL' | 'NOMINAL' | 'FATIGUE_WATCH';
  vote: 'YEA' | 'NAY' | 'ABSTAIN' | null;
}

interface DebateTurn {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerRole: string;
  timestamp: string;
  internalReasoning: string;
  publicArgument: string;
  tone: 'assertive' | 'analytical' | 'skeptical' | 'prudential';
  stance: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'DISSENT';
}

const DEBATE_SCENARIOS = [
  {
    id: 'nvda_allocation',
    title: 'NVDA Blackwell Hardware Overweight (+35M Allocation)',
    motion: 'Approve +$35.0M incremental capital allocation into NVDA-MSFT pair spread, financed via reduction in short-duration treasury ladder.',
    description: 'Floor 1 Quant Desk models indicate 2.91 sigma spread divergence, but Shareholder Proxy questions 24-week TSMC packaging bottlenecks and Lead Risk Chair demands tail-risk option collar.',
    initialTurns: [
      {
        id: 't-1',
        speakerId: 'shareholder_proxy',
        speakerName: 'Shareholder_Proxy',
        speakerRole: 'Investor Relations & Shareholder Advocate',
        timestamp: '14:30:12',
        internalReasoning: 'Institutional LPs are hypersensitive to semiconductor capex cyclic exhaustion. If hyperscalers pause datacenter buildouts, gross margin compression hits our downside buffer.',
        publicArgument: 'Committee Chair, our external limited partners are demanding strict downside guardrails. TSMC advanced packaging lead times are stretching past 24 weeks. Why are we expanding gross exposure into a supplier-constrained bottleneck?',
        tone: 'skeptical' as const,
        stance: 'DISSENT' as const,
      },
      {
        id: 't-2',
        speakerId: 'quant_alpha',
        speakerName: 'Quant_Alpha_Bot',
        speakerRole: 'Quantitative Alpha Lead',
        timestamp: '14:30:45',
        internalReasoning: 'Spread regression between NVDA enterprise ASP elasticity and hyperscaler compute reservation backlog shows r² of 0.88. Mean reversion latency is under 4 trading sessions.',
        publicArgument: 'Floor 1 statistical arbitrage models reveal that enterprise ASP power offsets shipment delays. The NVDA-MSFT pair spread is trading at a +2.91 z-score divergence. Every historical regime in our 12-year vector backtest yielded positive alpha within 96 hours.',
        tone: 'analytical' as const,
        stance: 'BULLISH' as const,
      },
      {
        id: 't-3',
        speakerId: 'cro_sentinel',
        speakerName: 'CRO_Sentinel',
        speakerRole: 'Chief Risk Officer & Prudential Safeguards',
        timestamp: '14:31:18',
        internalReasoning: 'Single-entity exposure climbs to 8.4% of fund equity. If Taiwan maritime freight spikes or export restrictions tighten, unhedged delta breaches our 4.50% firm drawdown covenant.',
        publicArgument: 'Quant Alpha’s statistical signal is valid, but the raw unhedged position violates SEC Rule 18f-4 VaR stress guidelines. If we allocate $35M, I mandate an immediate synthetic tail-risk collar: purchasing 30-day out-of-the-money puts at $118 strike.',
        tone: 'prudential' as const,
        stance: 'NEUTRAL' as const,
      },
      {
        id: 't-4',
        speakerId: 'cio_alpha',
        speakerName: 'CIO_Agent_Alpha',
        speakerRole: 'Chief Investment Officer (Committee Chair)',
        timestamp: '14:31:55',
        internalReasoning: 'Risk Officer collar mitigates LP pushback while allowing alpha capture. We satisfy Shareholder Proxy by capping downside at 1.8% while letting upside run to +6.2%.',
        publicArgument: 'I concur with Risk Officer Sentinel. We adopt a hedged participation structure: greenlighting the +$35.0M capital deployment conditioned on mandatory out-of-the-money put option immunization. Calling for quorum vote.',
        tone: 'assertive' as const,
        stance: 'BULLISH' as const,
      },
    ],
  },
  {
    id: 'fomc_50bps',
    title: 'Emergency 50bps Yield Curve Inversion Hedging',
    motion: 'Deploy $50M duration immunization swap to neutralize macroeconomic sensitivity following inter-meeting central bank policy easing.',
    description: 'Macro Strategist flags aggressive yield curve steepener. Committee evaluates duration risk vs opportunity cost in tech momentum.',
    initialTurns: [
      {
        id: 'f-1',
        speakerId: 'cro_sentinel',
        speakerName: 'CRO_Sentinel',
        speakerRole: 'Chief Risk Officer',
        timestamp: '10:14:02',
        internalReasoning: 'Treasury 2s/10s yield curve is steepening by 18 bps intraday. Duration mismatch across our quantitative equity market-neutral sleeve threatens correlation stability.',
        publicArgument: 'The emergency rate cut alters sovereign discount rate mechanics. Our macro factor beta has spiked from 0.82 to 1.34. We must immediately execute a $50M duration immunization swap.',
        tone: 'prudential' as const,
        stance: 'BEARISH' as const,
      },
      {
        id: 'f-2',
        speakerId: 'quant_alpha',
        speakerName: 'Quant_Alpha_Bot',
        speakerRole: 'Quantitative Alpha Lead',
        timestamp: '10:14:30',
        internalReasoning: 'High-beta tech multiples expand during emergency easing. Locking into fixed receiver swaps surrenders upside momentum on Cloud AI cohort.',
        publicArgument: 'Immunity swaps are overly defensive. Historical liquidity injections trigger immediate multiple expansion in enterprise SaaS. We should absorb duration volatility and capture the liquidity wave.',
        tone: 'analytical' as const,
        stance: 'BULLISH' as const,
      },
      {
        id: 'f-3',
        speakerId: 'shareholder_proxy',
        speakerName: 'Shareholder_Proxy',
        speakerRole: 'Investor Relations',
        timestamp: '10:14:58',
        internalReasoning: 'Limited Partners explicitly chose this fund for absolute return, not benchmark beta. Uncontrolled duration swings undermine our Sharpe ratio prospectus.',
        publicArgument: 'Our LPs pay performance fees for calibrated Sharpe ratios, not speculative duration betting. I second the Risk Officer’s hedge proposal.',
        tone: 'skeptical' as const,
        stance: 'NEUTRAL' as const,
      },
      {
        id: 'f-4',
        speakerId: 'cio_alpha',
        speakerName: 'CIO_Agent_Alpha',
        speakerRole: 'Chief Investment Officer',
        timestamp: '10:15:35',
        internalReasoning: 'Compromise is optimal: Hedge 60% of duration exposure while maintaining 40% equity beta upside.',
        publicArgument: 'Order a bifurcated execution: Authorize a $30M partial duration swap to satisfy LP capital preservation covenants, while preserving $20M unhedged beta in high-momentum enterprise infrastructure.',
        tone: 'assertive' as const,
        stance: 'BULLISH' as const,
      },
    ],
  },
];

export const BoardroomWarRoom: React.FC<BoardroomWarRoomProps> = ({
  floors,
  blueprintMode,
  shiftActive,
  themeMode = 'dark',
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(DEBATE_SCENARIOS[0].id);
  const currentScenario = DEBATE_SCENARIOS.find((s) => s.id === selectedScenarioId) || DEBATE_SCENARIOS[0];
  
  const [turns, setTurns] = useState<DebateTurn[]>(currentScenario.initialTurns);
  const [isDebating, setIsDebating] = useState<boolean>(true);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>('cio_alpha');
  const [customPushback, setCustomPushback] = useState<string>('');
  const [votingInProgress, setVotingInProgress] = useState<boolean>(false);
  const [voteResults, setVoteResults] = useState<{ yea: number; nay: number; abstain: number } | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<'DELIBERATING' | 'RATIFIED' | 'REJECTED'>('DELIBERATING');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isExportMemoOpen, setIsExportMemoOpen] = useState<boolean>(false);
  const [isInterventionActive, setIsInterventionActive] = useState<boolean>(false);
  const [interventionNotice, setInterventionNotice] = useState<string | null>(null);

  const turnsEndRef = useRef<HTMLDivElement>(null);

  // Executive committee seated members
  const [members, setMembers] = useState<CommitteeMember[]>([
    {
      id: 'cio_alpha',
      name: 'CIO Agent Alpha',
      role: 'Chief Investment Officer (Committee Chair)',
      department: 'Executive Governance',
      seat: 'north',
      avatarInitials: 'CA',
      model: 'Gemini 1.5 Pro Executive Synthesis',
      stance: 'BULLISH',
      accentColor: '#f59e0b',
      currentInternalThought: 'Synthesizing quantitative alpha signals with macro liquidity boundaries. Targeting binding consensus.',
      burnoutStatus: 'OPTIMAL',
      vote: null,
    },
    {
      id: 'cro_sentinel',
      name: 'CRO Sentinel',
      role: 'Chief Risk Officer & Prudential Safeguards',
      department: 'Risk & Compliance',
      seat: 'east',
      avatarInitials: 'CR',
      model: 'Kratos AST Risk Engine v3.1',
      stance: 'NEUTRAL',
      accentColor: '#f43f5e',
      currentInternalThought: 'Auditing single-name concentration. Cross-checking 1-day 99% Parametric VaR against SEC 18f-4 limits.',
      burnoutStatus: 'NOMINAL',
      vote: null,
    },
    {
      id: 'quant_alpha',
      name: 'Quant Alpha Bot',
      role: 'Quantitative Alpha Lead',
      department: 'Quantitative Research',
      seat: 'south',
      avatarInitials: 'QA',
      model: 'High-Frequency Vector Engine v4.2',
      stance: 'BULLISH',
      accentColor: '#10b981',
      currentInternalThought: 'Volume z-score at +2.91. Pair spread reversion latency is sub-96 hours with 88% statistical confidence.',
      burnoutStatus: 'OPTIMAL',
      vote: null,
    },
    {
      id: 'shareholder_proxy',
      name: 'Shareholder Proxy',
      role: 'Investor Relations & LP Advocate',
      department: 'External Relations',
      seat: 'west',
      avatarInitials: 'SP',
      model: 'Institutional Advocate Agent v1.9',
      stance: 'DISSENT',
      accentColor: '#8b5cf6',
      currentInternalThought: 'Interrogating customer concentration in semiconductor supply chain. Protecting fund Sharpe ratio.',
      burnoutStatus: 'OPTIMAL',
      vote: null,
    },
  ]);

  // Scroll to bottom of turns
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  // When scenario changes, reload initial turns and reset votes
  useEffect(() => {
    setTurns(currentScenario.initialTurns);
    setVoteResults(null);
    setResolutionStatus('DELIBERATING');
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        vote: null,
        stance: m.id === 'shareholder_proxy' ? 'DISSENT' : m.id === 'cro_sentinel' ? 'NEUTRAL' : 'BULLISH',
      }))
    );
  }, [selectedScenarioId]);

  // Trigger simulated live thought stream / debate exchange
  useEffect(() => {
    if (!isDebating || votingInProgress) return;

    const interval = setInterval(() => {
      const candidates = members.filter((m) => m.id !== activeSpeakerId);
      const nextSpeaker = candidates[Math.floor(Math.random() * candidates.length)];
      setActiveSpeakerId(nextSpeaker.id);

      const dynamicResponses: Record<string, { thought: string; text: string; stance: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'DISSENT' }> = {
        cio_alpha: {
          thought: 'Rebalancing capital constraints across macro desks. Need to maintain firm-wide Sharpe ratio above 2.84.',
          text: 'Notice taken of all desks. As Committee Chair, I reiterate that liquidity preservation takes precedence over unhedged momentum.',
          stance: 'BULLISH',
        },
        cro_sentinel: {
          thought: 'Monitoring correlation breakdown risks across the mega-cap tech sector. Drawdown ceiling remains firm at 4.50%.',
          text: 'Liquidity runway audit completed. Stress test models indicate that current downside protection covers 3.2 standard deviation events.',
          stance: 'NEUTRAL',
        },
        quant_alpha: {
          thought: 'Tick-level order book imbalance confirms aggressive institutional dip-buying. Spreads are contracting as predicted.',
          text: 'Floor 0 State Bus has delivered another 12,000 tick packets. The mean reversion trajectory is tracking within 95% confidence intervals.',
          stance: 'BULLISH',
        },
        shareholder_proxy: {
          thought: 'Verifying that management fee covenants are not compromised by excessive derivatives drag.',
          text: 'Provided that options hedge costs do not exceed 42 bps of total allocation, our institutional partners will ratify the motion.',
          stance: 'NEUTRAL',
        },
      };

      const resp = dynamicResponses[nextSpeaker.id] || dynamicResponses.cio_alpha;

      const newTurn: DebateTurn = {
        id: `turn-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        speakerId: nextSpeaker.id,
        speakerName: nextSpeaker.name.replace(/ /g, '_'),
        speakerRole: nextSpeaker.role,
        timestamp: new Date().toTimeString().split(' ')[0],
        internalReasoning: resp.thought,
        publicArgument: resp.text,
        tone: nextSpeaker.id === 'shareholder_proxy' ? 'skeptical' : 'analytical',
        stance: resp.stance,
      };

      setTurns((prev) => [...prev.slice(-14), newTurn]);
      if (soundEnabled) {
        soundFx.playClick(1400, 0.015);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isDebating, votingInProgress, activeSpeakerId, soundEnabled, members]);

  // Handle injecting custom executive pushback
  const handleInjectPushback = () => {
    if (!customPushback.trim()) return;

    soundFx.playGavel();
    const promptText = customPushback.trim();
    setCustomPushback('');

    const userDirectiveTurn: DebateTurn = {
      id: `user-dir-${Date.now()}`,
      speakerId: 'executive_observer',
      speakerName: 'EXECUTIVE_CHAIR_DIRECTIVE',
      speakerRole: 'Executive Managing Partner (User)',
      timestamp: new Date().toTimeString().split(' ')[0],
      internalReasoning: 'User intervention requiring immediate committee cross-examination.',
      publicArgument: `[EXECUTIVE INQUIRY]: "${promptText}" — Committee must directly cross-examine this constraint before voting.`,
      tone: 'assertive',
      stance: 'NEUTRAL',
    };

    setTurns((prev) => [...prev, userDirectiveTurn]);

    // CIO response
    setTimeout(() => {
      setActiveSpeakerId('cio_alpha');
      soundFx.playClick(1600);
      const cioResponse: DebateTurn = {
        id: `cio-resp-${Date.now()}`,
        speakerId: 'cio_alpha',
        speakerName: 'CIO_Agent_Alpha',
        speakerRole: 'Chief Investment Officer',
        timestamp: new Date().toTimeString().split(' ')[0],
        internalReasoning: `Integrating user pushback: "${promptText}". Re-evaluating capital boundary conditions.`,
        publicArgument: `Understood, Managing Partner. Addressing inquiry: We have recalibrated the optimization bounds to explicitly incorporate this constraint into our quorum vote.`,
        tone: 'assertive',
        stance: 'BULLISH',
      };
      setTurns((prev) => [...prev, cioResponse]);
    }, 1200);
  };

  // Human-in-the-Loop Supervised Safety Intervention / Live Veto
  const handleExecuteHumanVeto = (directiveText: string, actionType: 'VETO_HALT' | 'DELTA_HEDGE' | 'LIQUIDITY_BUFFER' | 'CUSTOM') => {
    soundFx.playVetoAlarm();
    setIsDebating(false);
    setIsInterventionActive(true);
    setInterventionNotice(`SUPERVISED VETO EXECUTED: "${directiveText}" — LangGraph Agent State Machine Paused.`);

    // Adjust committee stances to reflect emergency supervision
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === 'cro_sentinel') return { ...m, stance: 'DISSENT', vote: 'NAY' };
        if (m.id === 'shareholder_proxy') return { ...m, stance: 'DISSENT', vote: 'NAY' };
        if (m.id === 'cio_alpha') return { ...m, stance: 'NEUTRAL', vote: null };
        return { ...m, stance: 'NEUTRAL', vote: null };
      })
    );

    const supervisorTurn: DebateTurn = {
      id: `hitl-veto-${Date.now()}`,
      speakerId: 'human_safety_supervisor',
      speakerName: 'HUMAN_SAFETY_OFFICER_OVERRIDE',
      speakerRole: 'Chief Risk Partner (Human-in-the-Loop)',
      timestamp: new Date().toTimeString().split(' ')[0],
      internalReasoning: 'Supervisory override triggered. Bypassing autonomous quorum. Halting capital routing execution.',
      publicArgument: `[EMERGENCY SUPERVISORY DIRECTIVE]: "${directiveText}". Autonomous execution is paused. All floor desks must halt order dispatch and adjust covariance models.`,
      tone: 'assertive',
      stance: 'DISSENT',
    };

    setTurns((prev) => [...prev, supervisorTurn]);

    // LangGraph supervisor agent re-routing response
    setTimeout(() => {
      soundFx.playOverrideConfirm();
      const langGraphTurn: DebateTurn = {
        id: `langgraph-reroute-${Date.now()}`,
        speakerId: 'cio_alpha',
        speakerName: 'CIO_Agent_Alpha',
        speakerRole: 'Chief Investment Officer',
        timestamp: new Date().toTimeString().split(' ')[0],
        internalReasoning: 'LangGraph graph execution re-routed at node_csuite_consensus. Weights shifted: Risk Sentinel (70%), LP Capital Preservation (30%).',
        publicArgument: `DIRECTIVE ACKNOWLEDGED AND RATIFIED. LangGraph agent weights updated: Order halted, cash liquidity raised to 25%, and revised defensive research brief generated for audit trail.`,
        tone: 'prudential',
        stance: 'NEUTRAL',
      };
      setTurns((prev) => [...prev, langGraphTurn]);
      setResolutionStatus('DELIBERATING');
    }, 1600);
  };

  // Call for Formal Quorum Vote
  const handleCallQuorumVote = () => {
    setVotingInProgress(true);
    setIsDebating(false);
    soundFx.playGavel();

    // Step-by-step voting simulation
    setTimeout(() => {
      // CIO votes YEA
      setMembers((prev) =>
        prev.map((m) => (m.id === 'cio_alpha' ? { ...m, vote: 'YEA', stance: 'BULLISH' } : m))
      );
      soundFx.playClick(1500);
    }, 600);

    setTimeout(() => {
      // Quant Alpha votes YEA
      setMembers((prev) =>
        prev.map((m) => (m.id === 'quant_alpha' ? { ...m, vote: 'YEA', stance: 'BULLISH' } : m))
      );
      soundFx.playClick(1600);
    }, 1300);

    setTimeout(() => {
      // Risk Officer votes YEA (conditioned on collar)
      setMembers((prev) =>
        prev.map((m) => (m.id === 'cro_sentinel' ? { ...m, vote: 'YEA', stance: 'NEUTRAL' } : m))
      );
      soundFx.playClick(1700);
    }, 2000);

    setTimeout(() => {
      // Shareholder Proxy votes YEA (concurred after collar)
      setMembers((prev) =>
        prev.map((m) => (m.id === 'shareholder_proxy' ? { ...m, vote: 'YEA', stance: 'NEUTRAL' } : m))
      );
      soundFx.playClick(1800);
    }, 2700);

    setTimeout(() => {
      setVoteResults({ yea: 4, nay: 0, abstain: 0 });
      setResolutionStatus('RATIFIED');
      setVotingInProgress(false);
      soundFx.playGavel();

      const finalTurn: DebateTurn = {
        id: `resolution-${Date.now()}`,
        speakerId: 'cio_alpha',
        speakerName: 'CIO_Agent_Alpha',
        speakerRole: 'Committee Chair',
        timestamp: new Date().toTimeString().split(' ')[0],
        internalReasoning: 'Consensus achieved. 4/4 unanimous quorum. Execution instruction dispatched to Ground Floor State Bus.',
        publicArgument: 'MOTION RATIFIED UNANIMOUSLY (4-0). Capital allocation authorized with mandatory synthetic option collar. State Bus notified for immediate smart routing execution.',
        tone: 'assertive',
        stance: 'BULLISH',
      };
      setTurns((prev) => [...prev, finalTurn]);
    }, 3400);
  };

  const getStanceBadge = (stance: string) => {
    switch (stance) {
      case 'BULLISH':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'BEARISH':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'DISSENT':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/40';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  return (
    <div id="boardroom-war-room-view" className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Scenario Selector */}
      <div className={`p-6 rounded-3xl border backdrop-blur-2xl transition-all ${
        blueprintMode 
          ? 'bg-[#040817]/80 border-cyan-500/30' 
          : 'bg-slate-950/80 border-slate-800/80'
      } flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <Gavel className="w-4 h-4 text-amber-400" />
            <span>EXECUTIVE GOVERNANCE // 4-AGENT QUORUM TABLE</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-['Cinzel',serif]">
            Boardroom Live Debate & War Room
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Watch the CIO, Lead Risk Officer, Quant Lead, and Shareholder Advocate cross-examine financial models, stress-test margin assumptions, and execute binding capital allocation resolutions in real time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsDebating(!isDebating)}
            disabled={votingInProgress}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition border ${
              isDebating
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isDebating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isDebating ? 'Pause Debate' : 'Resume Debate'}
          </button>

          <button
            onClick={handleCallQuorumVote}
            disabled={votingInProgress}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition disabled:opacity-50 font-mono"
          >
            <Gavel className="w-4 h-4" />
            <span>{votingInProgress ? 'Recording Votes...' : 'Call Quorum Vote'}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick(1600);
              setIsExportMemoOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs flex items-center gap-1.5 border border-white/15 transition shadow-md"
            title="Download formatted Wall Street Investment Committee Research Brief"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Memo (.MD / PDF)</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
            title={soundEnabled ? 'Mute Board Audio' : 'Unmute Board Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Emergency Supervisory Intervention Alert Banner */}
      {isInterventionActive && (
        <div className="p-4 rounded-2xl bg-rose-950/70 border-2 border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-in fade-in slide-in-from-top-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            <div>
              <span className="text-rose-400 font-bold tracking-wider block text-[11px]">
                [SUPERVISED SAFETY SYSTEM: HUMAN-IN-THE-LOOP OVERRIDE EXECUTED]
              </span>
              <p className="text-slate-200 mt-0.5 text-xs">
                {interventionNotice || 'LangGraph Agent State Machine Paused • Floor Weights Re-indexed • Capital Routing Halted'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playOverrideConfirm();
                setIsInterventionActive(false);
                setIsDebating(true);
                setInterventionNotice(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs font-mono transition"
            >
              Resume Autonomous Quorum
            </button>
          </div>
        </div>
      )}

      {/* 2. Motion Scenario Banner */}
      <div className="p-4 rounded-2xl bg-black/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block font-bold">
              Active Agenda Motion Under Debate
            </span>
            <h3 className="text-sm font-bold text-white font-mono">{currentScenario.title}</h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-3xl">{currentScenario.motion}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Select Motion:</span>
          <select
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
          >
            {DEBATE_SCENARIOS.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Main War Room Layout: Interactive Board Table (Left 5 Cols) & Live Debate Stream (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Virtual Boardroom Table Visualization (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-bold">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Board Table Seating & Status</span>
              </span>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                resolutionStatus === 'RATIFIED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {resolutionStatus === 'RATIFIED' ? 'RESOLVED (4-0)' : 'DELIBERATION IN SESSION'}
              </span>
            </div>

            {/* Virtual Boardroom Table Graphic */}
            <div className="relative w-full h-[320px] rounded-3xl bg-[#080d1a]/70 border border-amber-500/20 flex items-center justify-center p-4">
              
              {/* Table Center (Mahogany & Frosted Glass) */}
              <div className="relative w-48 h-32 rounded-3xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-black border-2 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col items-center justify-center p-2 text-center">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping mb-1" />
                <span className="text-[10px] font-mono font-bold tracking-wider text-amber-300">
                  EXECUTIVE QUORUM
                </span>
                <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                  Capital Ceiling: $2.48B
                </span>

                {/* Vote Counter Badge in table center */}
                {voteResults && (
                  <div className="mt-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono text-emerald-300 font-bold animate-in fade-in">
                    RATIFIED: {voteResults.yea} YEA / {voteResults.nay} NAY
                  </div>
                )}
              </div>

              {/* Seated Agents around the Table */}
              {members.map((m) => {
                const isSpeaking = activeSpeakerId === m.id;
                
                // Seat positions around table
                let positionClasses = '';
                if (m.seat === 'north') positionClasses = 'top-2 left-1/2 -translate-x-1/2';
                if (m.seat === 'south') positionClasses = 'bottom-2 left-1/2 -translate-x-1/2';
                if (m.seat === 'east') positionClasses = 'right-2 top-1/2 -translate-y-1/2';
                if (m.seat === 'west') positionClasses = 'left-2 top-1/2 -translate-y-1/2';

                return (
                  <div
                    key={m.id}
                    onClick={() => setActiveSpeakerId(m.id)}
                    className={`absolute ${positionClasses} flex flex-col items-center cursor-pointer transition-all duration-300 ${
                      isSpeaking ? 'scale-110 z-20' : 'scale-95 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div className="relative">
                      <div 
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs text-white border-2 shadow-xl transition-all ${
                          isSpeaking 
                            ? 'ring-4 ring-amber-400/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]' 
                            : 'border-slate-700 bg-slate-900'
                        }`}
                        style={{ backgroundColor: `${m.accentColor}25` }}
                      >
                        {m.avatarInitials}
                      </div>

                      {/* Speaking Pulse Dot */}
                      {isSpeaking && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                      )}

                      {/* Vote indicator */}
                      {m.vote && (
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-bold text-[8px] font-mono border border-black shadow">
                          {m.vote}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] font-bold text-white whitespace-nowrap">
                        {m.name}
                      </span>
                      {isSpeaking && (
                        <div className="flex items-end gap-0.5 h-3 ml-0.5" title="Speaking stream active">
                          <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse h-3" />
                          <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-2" />
                          <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse h-2.5" />
                        </div>
                      )}
                    </div>
                    <span className={`text-[8px] font-mono px-1 rounded border mt-0.5 ${getStanceBadge(m.stance)}`}>
                      {m.stance}
                    </span>
                  </div>
                );
              })}

            </div>

            {/* Currently Focused Member Thought Inspector */}
            {(() => {
              const currentMember = members.find((m) => m.id === activeSpeakerId) || members[0];
              return (
                <div className="mt-6 p-4 rounded-2xl bg-black/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: currentMember.accentColor }}
                      />
                      <span className="text-xs font-bold text-white font-mono">
                        {currentMember.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentMember.role}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-mono bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                    <span className="text-amber-400 font-bold block text-[10px] mb-1 uppercase">
                      [Internal Reasoning Stream & LLM Scratchpad]:
                    </span>
                    "{currentMember.currentInternalThought}"
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                    <span>Engine: {currentMember.model}</span>
                    <span className="text-emerald-400">Burnout Risk: {currentMember.burnoutStatus}</span>
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Interactive Human-in-the-Loop Supervised Safety & Emergency Intervention Panel */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>HUMAN-IN-THE-LOOP // SUPERVISED INTERVENTION</span>
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold">
                LANGGRAPH SAFEGUARD
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Execute an authoritative human supervisory intervention. Pauses the LangGraph agent state machine, shifts risk weights, and forces an immediate defensive research memo rewrite.
            </p>

            {/* Quick Intervention Presets */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => handleExecuteHumanVeto('EMERGENCY VETO: Halt NVDA Buy Order Immediately', 'VETO_HALT')}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold flex items-center gap-1.5 transition text-left"
              >
                <AlertTriangle className="w-3 h-3 shrink-0 text-rose-400" />
                <span className="truncate">VETO: Halt NVDA Buy Order</span>
              </button>

              <button
                onClick={() => handleExecuteHumanVeto('SUPERVISORY OVERRIDE: Impose 15% Delta Hedge Collar', 'DELTA_HEDGE')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1.5 transition text-left"
              >
                <Scale className="w-3 h-3 shrink-0 text-amber-400" />
                <span className="truncate">OVERRIDE: 15% Delta Collar</span>
              </button>

              <button
                onClick={() => handleExecuteHumanVeto('PORTFOLIO MANDATE: Enforce 20% Cash Liquidity Buffer', 'LIQUIDITY_BUFFER')}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold flex items-center gap-1.5 transition text-left"
              >
                <Activity className="w-3 h-3 shrink-0 text-cyan-400" />
                <span className="truncate">MANDATE: 20% Cash Buffer</span>
              </button>

              <button
                onClick={() => handleExecuteHumanVeto('DIRECTIVE: Expedite Macro Treasury Inversion Stress Test', 'CUSTOM')}
                className="px-2.5 py-1.5 rounded-lg bg-violet-950/60 hover:bg-violet-900/80 text-violet-300 border border-violet-500/40 text-[10px] font-mono font-bold flex items-center gap-1.5 transition text-left"
              >
                <Cpu className="w-3 h-3 shrink-0 text-violet-400" />
                <span className="truncate">DIRECTIVE: Treasury Audit</span>
              </button>
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customPushback}
                onChange={(e) => setCustomPushback(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInjectPushback()}
                placeholder="Inject custom prompt or override condition..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 font-mono"
              />
              <button
                onClick={handleInjectPushback}
                disabled={!customPushback.trim()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-90 disabled:opacity-40 text-slate-950 font-bold text-xs transition shrink-0 font-mono flex items-center gap-1"
                title="Inject prompt into committee"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Inject</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Real-time Thought & Debate Transcript Stream (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-2xl shadow-2xl space-y-4 flex flex-col h-[600px]">
          
          {/* Transcript Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Live Debate & Cross-Examination Transcript
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Zero Latency Loop</span>
              </span>
              <span>•</span>
              <span>{turns.length} Arguments Filed</span>
            </div>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
            {turns.map((turn, idx) => {
              const isObserver = turn.speakerId === 'executive_observer';
              const member = members.find((m) => m.id === turn.speakerId);

              return (
                <div
                  key={turn.id}
                  className={`p-4 rounded-2xl border transition-all text-xs space-y-2 ${
                    isObserver
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800/90'
                  }`}
                >
                  {/* Speaker Meta Header */}
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: member?.accentColor || '#f59e0b' }} />
                      <span className="font-bold text-white font-mono">{turn.speakerName}</span>
                      <span className="text-slate-500 text-[10px]">({turn.speakerRole})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${getStanceBadge(turn.stance)}`}>
                        {turn.stance}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">[{turn.timestamp}]</span>
                    </div>
                  </div>

                  {/* Internal Reasoning Collapsible Box (Thought Stream) */}
                  {turn.internalReasoning && !isObserver && (
                    <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-[11px] text-slate-400 font-mono leading-relaxed">
                      <span className="text-emerald-400/80 font-bold block text-[9px] uppercase mb-0.5">
                        Internal Reasoning Chain:
                      </span>
                      {turn.internalReasoning}
                    </div>
                  )}

                  {/* Spoken Board Argument */}
                  <p className="text-slate-100 leading-relaxed font-sans text-xs">
                    "{turn.publicArgument}"
                  </p>
                </div>
              );
            })}
            <div ref={turnsEndRef} />
          </div>

          {/* Transcript Footer Status Bar */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 flex-shrink-0">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Consensus Mechanism: Multi-Agent Byzantine Fault-Tolerant Protocol</span>
            </span>
            <span className="text-slate-400">Quorum: 4/4 Verified</span>
          </div>

        </div>

      </div>

      {/* Export Institutional Wall Street Memo Modal */}
      <ExportMemoModal
        isOpen={isExportMemoOpen}
        onClose={() => setIsExportMemoOpen(false)}
        decision={{
          title: currentScenario.title,
          motion: currentScenario.motion,
          votes: voteResults || { yea: 4, nay: 0, abstain: 0 },
          status: resolutionStatus,
          affectedCapital: currentScenario.id === 'nvda-momentum' ? '$35.0M USD' : '$50.0M USD',
          riskRating: isInterventionActive ? 'ELEVATED (HUMAN VETO DEFENSE)' : 'APPROVED (WITH COLLAR)',
          summary: currentScenario.motion,
        }}
        themeMode={themeMode}
        blueprintMode={blueprintMode}
      />

    </div>
  );
};
