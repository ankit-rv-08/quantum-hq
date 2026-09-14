import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  FileText, 
  AlertTriangle, 
  Users, 
  DollarSign, 
  ShieldAlert, 
  ChevronRight, 
  Sparkles,
  Award,
  Filter
} from 'lucide-react';
import { BoardDecision } from '../types';
import { BOARDROOM_MEETINGS } from '../data/mockData';
import { soundFx } from '../utils/audio';

interface BoardroomArchiveProps {
  blueprintMode: boolean;
  themeMode?: 'dark' | 'light';
}

export const BoardroomArchive: React.FC<BoardroomArchiveProps> = ({ blueprintMode, themeMode = 'dark' }) => {
  const [meetings, setMeetings] = useState<BoardDecision[]>(BOARDROOM_MEETINGS);
  const [selectedMeeting, setSelectedMeeting] = useState<BoardDecision>(BOARDROOM_MEETINGS[0]);
  const [filterDecision, setFilterDecision] = useState<string>('ALL');

  // Calendar dates for September 2026
  const septemberDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-09-${dayNum.toString().padStart(2, '0')}`;
    const meeting = meetings.find((m) => m.date === dateStr);
    return { dayNum, dateStr, meeting };
  });

  const filteredMeetings = meetings.filter((m) => {
    if (filterDecision === 'ALL') return true;
    return m.decision === filterDecision;
  });

  const handleConveneEmergencyMeeting = () => {
    soundFx.playShockAlert();
    const newMeeting: BoardDecision = {
      id: `MEET-${Date.now()}`,
      date: '2026-09-14',
      meetingTitle: 'Emergency Ad-Hoc Quorum: Sudden Macro Sovereign Inversion Alert',
      decision: 'MANDATORY_HEDGE_ORDER',
      status: 'EXECUTED',
      votes: { yea: 3, nay: 0, abstain: 0 },
      summary: 'Emergency session convened following 10-year Treasury yield inversion anomaly. Quorum voted 3-0 to authorize immediate $60M duration hedge.',
      participants: ['CIO_Agent_Alpha', 'Lead_Risk_Chair', 'CRO_Sentinel'],
      affectedCapital: '$60,000,000',
      riskRating: 'ELEVATED',
      markdownTranscript: `### Emergency Investment Committee Executive Resolution #883
**Session Date**: 2026-09-14 | 14:45 EST
**Trigger**: Autonomous Macro Alert // Yield Curve Spike
**Quorum**: CIO_Agent_Alpha, Lead_Risk_Chair, CRO_Sentinel

#### 1. Instant Anomaly Trigger
Floor 2 Macro strategist flagged sudden liquidity divergence in overnight repo facilities.

#### 2. Risk Evaluation
Lead Risk Chair determined potential 3.8% drawdown vulnerability on growth asset tranches without rapid duration hedging.

#### 3. Binding Resolution
* Authorize $60,000,000 allocation into short-duration cash equivalents and inverse interest rate swaps.
* Execution status: Dispatched via Ground Floor Redis event bus.`,
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    setSelectedMeeting(newMeeting);
  };

  const isLight = themeMode === 'light' && !blueprintMode;

  return (
    <div id="boardroom-archive-view" className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border backdrop-blur-xl transition-colors ${
        blueprintMode
          ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300'
          : isLight
          ? 'bg-white/95 border-slate-200/90 shadow-sm text-slate-800'
          : 'bg-slate-950/70 border-slate-800/80 text-white'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>EXECUTIVE GOVERNANCE RECORD</span>
          </div>
          <h2 className={`text-2xl font-bold font-['Cinzel',serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Boardroom Meeting Archive
          </h2>
          <p className={`text-xs mt-1 max-w-xl ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Complete immutable ledger of past executive committee debates, risk audits, and formal binding capital decisions.
          </p>
        </div>

        <button
          onClick={handleConveneEmergencyMeeting}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Convene Emergency Quorum</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Calendar & Timeline List (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* September 2026 Interactive Calendar Widget */}
          <div className={`p-6 rounded-3xl border backdrop-blur-xl space-y-4 transition-colors ${
            blueprintMode
              ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300'
              : isLight
              ? 'bg-white/95 border-slate-200/90 shadow-sm text-slate-800'
              : 'bg-slate-950/70 border-slate-800/80 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>September 2026</span>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Trading Days</span>
            </div>

            {/* Weekdays */}
            <div className={`grid grid-cols-7 gap-1 text-center text-[10px] font-mono pb-1 border-b ${
              isLight ? 'text-slate-400 border-slate-200' : 'text-slate-500 border-slate-800'
            }`}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {/* Offset for Sep 1 2026 (Tuesday = 2 empty cells) */}
              <div className="h-8" />
              <div className="h-8" />

              {septemberDays.map(({ dayNum, dateStr, meeting }) => {
                const isSelected = selectedMeeting?.date === dateStr;
                const hasMeeting = !!meeting;

                return (
                  <button
                    key={dayNum}
                    onClick={() => {
                      if (meeting) {
                        soundFx.playClick(1400);
                        setSelectedMeeting(meeting);
                      }
                    }}
                    disabled={!hasMeeting}
                    className={`h-9 rounded-lg flex flex-col items-center justify-center relative transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : hasMeeting
                        ? 'bg-amber-500/20 text-amber-500 dark:text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 font-semibold'
                        : isLight
                        ? 'text-slate-400 hover:text-slate-600'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasMeeting && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className={`pt-2 border-t flex items-center justify-between text-[10px] ${
              isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
            }`}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Executive Session Held</span>
              </span>
              <span className="text-emerald-500 font-mono">Quorum Standard: 3/3</span>
            </div>
          </div>

          {/* Past Meetings List with Filter */}
          <div className={`p-6 rounded-3xl border backdrop-blur-xl space-y-4 transition-colors ${
            blueprintMode
              ? 'bg-cyan-950/30 border-cyan-500/30'
              : isLight
              ? 'bg-white/95 border-slate-200/90 shadow-sm'
              : 'bg-slate-950/70 border-slate-800/80'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Meeting Sessions</h3>
              <select
                value={filterDecision}
                onChange={(e) => setFilterDecision(e.target.value)}
                className={`border text-[11px] rounded-lg px-2.5 py-1 font-mono focus:outline-none focus:border-emerald-400 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-black border-slate-700 text-slate-300'
                }`}
              >
                <option value="ALL">All Decisions</option>
                <option value="APPROVED_INCREMENTAL_BUY">Approved Buy</option>
                <option value="REDUCED_LEVERAGE_CEILING">Reduced Leverage</option>
                <option value="MANDATORY_HEDGE_ORDER">Mandatory Hedge</option>
              </select>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {filteredMeetings.map((m) => {
                const isSelected = selectedMeeting.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      soundFx.playClick(1300);
                      setSelectedMeeting(m);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-sm scale-[1.01]'
                          : 'bg-slate-900 border-emerald-400 shadow-md scale-[1.01]'
                        : isLight
                        ? 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200'
                        : 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-mono text-emerald-500 dark:text-emerald-400 font-semibold">{m.date}</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        m.decision === 'APPROVED_INCREMENTAL_BUY'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                          : m.decision === 'REDUCED_LEVERAGE_CEILING'
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                      }`}>
                        {m.decision.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h4 className={`font-bold text-xs leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {m.meetingTitle}
                    </h4>
                    <p className={`text-[11px] line-clamp-2 mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {m.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Structured Markdown Decision Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`p-8 rounded-3xl border backdrop-blur-2xl shadow-2xl space-y-6 transition-colors ${
            blueprintMode
              ? 'bg-cyan-950/30 border-cyan-500/30'
              : isLight
              ? 'bg-white/95 border-slate-200/90 shadow-xl'
              : 'bg-slate-950/80 border-slate-800/80'
          }`}>
            
            {/* Resolution Banner */}
            <div className={`flex flex-wrap items-start justify-between gap-4 pb-6 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <div>
                <div className={`flex items-center gap-2 text-xs font-mono mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>RECORD ID: {selectedMeeting.id}</span>
                  <span>•</span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-semibold">{selectedMeeting.date}</span>
                </div>
                <h3 className={`text-xl font-bold font-['Cinzel',serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedMeeting.meetingTitle}
                </h3>
              </div>

              <div className="text-right">
                <span className={`text-[10px] uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Capital Allocated
                </span>
                <span className="text-2xl font-bold text-emerald-500 dark:text-emerald-400 font-mono font-mono-numbers">
                  {selectedMeeting.affectedCapital}
                </span>
              </div>
            </div>

            {/* Voting Breakdown Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className={`p-3.5 rounded-xl border text-center ${
                isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'
              }`}>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Yea Votes</span>
                <span className={`text-xl font-bold font-mono block mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedMeeting.votes.yea}
                </span>
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Binding Approval</span>
              </div>
              <div className={`p-3.5 rounded-xl border text-center ${
                isLight ? 'bg-rose-50/70 border-rose-200' : 'bg-rose-950/20 border-rose-500/30'
              }`}>
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Nay / Dissent</span>
                <span className={`text-xl font-bold font-mono block mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedMeeting.votes.nay}
                </span>
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Formal Objections</span>
              </div>
              <div className={`p-3.5 rounded-xl border text-center ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'
              }`}>
                <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Risk Rating
                </span>
                <span className={`text-base font-bold font-mono block mt-1 ${
                  selectedMeeting.riskRating === 'HIGH' ? 'text-rose-500' : 'text-amber-500'
                }`}>
                  {selectedMeeting.riskRating}
                </span>
                <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>VaR Monitored</span>
              </div>
            </div>

            {/* Attending Autonomous Agents */}
            <div className="space-y-2">
              <span className={`text-xs font-mono uppercase flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>Quorum Attendees</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedMeeting.participants.map((p, idx) => (
                  <span 
                    key={idx} 
                    className={`text-xs px-3 py-1 rounded-lg border font-mono flex items-center gap-1.5 ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-800'
                        : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{p.replace(/_/g, ' ')}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Formatted Markdown Transcript */}
            <div className={`space-y-3 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <span className={`text-xs font-mono uppercase flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Executive Minutes & Binding Transcript</span>
              </span>

              <div className={`p-6 rounded-2xl border font-mono text-xs whitespace-pre-wrap leading-relaxed space-y-4 ${
                isLight
                  ? 'bg-slate-50/90 border-slate-200 text-slate-800 shadow-inner'
                  : 'bg-black/60 border-slate-800/80 text-slate-300'
              }`}>
                {selectedMeeting.markdownTranscript}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
