import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  X, 
  ShieldCheck, 
  Award, 
  Layers, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { BoardDecision, ThemeMode } from '../types';
import { soundFx } from '../utils/audio';

interface ExportMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: {
    title: string;
    motion: string;
    votes: { yea: number; nay: number; abstain: number };
    status: string;
    affectedCapital?: string;
    riskRating?: string;
    date?: string;
    summary?: string;
  };
  themeMode?: ThemeMode;
  blueprintMode?: boolean;
}

export const ExportMemoModal: React.FC<ExportMemoModalProps> = ({
  isOpen,
  onClose,
  decision,
  themeMode = 'dark',
  blueprintMode = false,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const dateStr = decision.date || new Date().toISOString().split('T')[0];
  const memoDocketId = `AQ-MEMO-${dateStr.replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;
  const capital = decision.affectedCapital || '$35.0M USD';
  const risk = decision.riskRating || 'ELEVATED (COLLAR MANDATED)';

  const markdownContent = `# ACE & COMPANY
## EXECUTIVE INVESTMENT COMMITTEE RESEARCH BRIEF
**DOCKET ID:** ${memoDocketId}
**DATE OF RECORD:** ${dateStr}
**CLASSIFICATION:** STRICTLY CONFIDENTIAL // INSTITUTIONAL LP ONLY
**RATIFICATION STATUS:** ${decision.status} (${decision.votes.yea} YEA / ${decision.votes.nay} NAY)

---

### 1. RESOLUTION TITLE
${decision.title}

### 2. FORMAL MOTION
"${decision.motion}"

### 3. EXECUTIVE DELIBERATION SUMMARY
${decision.summary || 'Following multi-floor consensus deliberation between Floor 1 (Quantitative Research), Floor 2 (Fundamental & Macro), Floor 3 (Prudential Risk & Compliance), and Floor 4 (Executive Board), the motion was approved with mandatory downside delta collar immunization.'}

### 4. CAPITAL ALLOCATION & RISK BOUNDARIES
- **Gross Capital Affected:** ${capital}
- **Prudential Risk Rating:** ${risk}
- **Mandatory Collar:** 30-day out-of-the-money put options strike $118
- **SEC Rule 18f-4 Compliance:** Verified by CRO_Sentinel (Parametric 1-Day VaR: 0.57%)
- **Taxonomy Verification:** Form 8-K & 10-Q validated under ASC 606 by SEC_Auditor_Kratos

### 5. COMMITTEE SIGN-OFFS & CRYPTOGRAPHIC ATTESTATIONS
1. **CIO_Agent_Alpha** — Chief Investment Officer [ATTESTED: 0x8f22e...b9]
2. **CRO_Sentinel** — Chief Risk Officer [ATTESTED: 0x4a11c...3f]
3. **Quant_Alpha_Bot** — Quantitative Alpha Lead [ATTESTED: 0x9923d...6c]
4. **Shareholder_Proxy** — LP Capital Advocate [ATTESTED: 0x1102e...88]

---
*ACE & Company • 100 Wall Street, New York, NY 10005 • Autonomous Multi-Agent Asset Management*`;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    soundFx.playClick(1900);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    soundFx.playClick(1500);
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${memoDocketId}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    soundFx.playClick(1400);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="export-memo-modal-card"
        className={`w-full max-w-3xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl ${
          blueprintMode
            ? 'bg-[#030717] border-cyan-500/40 text-cyan-300'
            : themeMode === 'light'
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#070b16] border-slate-800 text-slate-100'
        }`}
      >
        {/* Modal Top Bar */}
        <div className={`p-5 border-b flex items-center justify-between gap-4 ${
          themeMode === 'light' && !blueprintMode ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.02]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-amber-500 font-bold block">
                Wall Street Institutional Research Brief
              </span>
              <h3 className={`text-base font-bold font-['Cinzel',serif] ${
                themeMode === 'light' && !blueprintMode ? 'text-slate-950' : 'text-white'
              }`}>
                ACE & COMPANY // COMMITTEE MEMORANDUM
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition ${
                themeMode === 'light' && !blueprintMode
                  ? 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy MD'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .MD</span>
            </button>

            <button
              onClick={handlePrint}
              className={`p-1.5 rounded-xl border transition ${
                themeMode === 'light' && !blueprintMode
                  ? 'bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Print / Save as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundFx.playClick(1200);
                onClose();
              }}
              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Formatted Paper Preview Document (Wall Street Style) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs leading-relaxed font-sans">
          
          {/* Institutional Letterhead */}
          <div className={`p-6 rounded-2xl border ${
            themeMode === 'light' && !blueprintMode
              ? 'bg-slate-50 border-slate-200 text-slate-800'
              : 'bg-black/50 border-white/5 text-slate-300'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-4 border-slate-300/30 gap-2 font-mono">
              <div>
                <span className="text-lg font-bold tracking-wider font-['Cinzel',serif] block text-amber-500">
                  ACE & COMPANY
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Quantitative Asset Management • Global Capital Committee
                </span>
              </div>
              <div className="text-right text-[11px]">
                <span className="font-bold block">{memoDocketId}</span>
                <span className="text-slate-500">Date: {dateStr}</span>
              </div>
            </div>

            {/* Grid Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px] mb-4">
              <div>
                <span className="text-slate-500 block text-[10px]">Quorum Outcome:</span>
                <span className="font-bold text-emerald-500">{decision.status} ({decision.votes.yea}-{decision.votes.nay})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Capital Allocation:</span>
                <span className="font-bold">{capital}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Risk Rating:</span>
                <span className="font-bold text-amber-500">{risk}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Supervisory Chain:</span>
                <span className="font-bold">LangGraph Multi-Agent</span>
              </div>
            </div>

            {/* Agenda Title & Motion */}
            <div className="space-y-2 mb-4">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                [Agenda Item & Verified Motion]:
              </span>
              <h4 className={`text-base font-bold font-mono ${
                themeMode === 'light' && !blueprintMode ? 'text-slate-900' : 'text-white'
              }`}>
                {decision.title}
              </h4>
              <p className="p-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 text-slate-300 font-mono text-xs">
                "{decision.motion}"
              </p>
            </div>

            {/* Analysis */}
            <div className="space-y-2 mb-4">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                [Committee Synthesis & Prudential Directives]:
              </span>
              <p className="text-slate-300 text-xs leading-relaxed">
                {decision.summary || 'The Executive Consensus Arena affirmed deployment parameters following multi-turn debate. Floor 1 algorithmic divergence verified at +2.91 sigma. Risk Chair enforced synthetic option collar to safeguard firm drawdowns beneath 4.50%. Compliance audited SEC Rule 18f-4 leverage compliance.'}
              </p>
            </div>

            {/* Attestations Signatures */}
            <div className="pt-4 border-t border-slate-300/30">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-3">
                [Cryptographic Committee Sign-Offs]:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[10px]">
                {[
                  { name: 'CIO_Agent_Alpha', title: 'Committee Chair', hash: '0x8f22...b9' },
                  { name: 'CRO_Sentinel', title: 'Chief Risk Officer', hash: '0x4a11...3f' },
                  { name: 'Quant_Alpha_Bot', title: 'Quant Lead', hash: '0x9923...6c' },
                  { name: 'Shareholder_Proxy', title: 'LP Advocate', hash: '0x1102...88' },
                ].map((att, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-1">
                    <span className="text-emerald-400 font-bold block truncate">{att.name}</span>
                    <span className="text-slate-500 block truncate">{att.title}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">{att.hash} ✓</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-[11px] font-mono ${
          themeMode === 'light' && !blueprintMode ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-white/10 bg-black/40 text-slate-500'
        }`}>
          <span>ACE & Company • Formatted for LP Distribution</span>
          <span className="text-emerald-500 font-semibold">Verified by Immutable Audit Trail</span>
        </div>
      </div>
    </div>
  );
};
