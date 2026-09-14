import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  AlertTriangle, 
  Activity, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  ShieldAlert, 
  Send,
  Building2
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface MarketShockSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteShock: (scenarioTitle: string, details: string) => void;
  blueprintMode: boolean;
  themeMode?: 'dark' | 'light';
}

const PRESET_SCENARIOS = [
  {
    id: 'blackwell_yield',
    title: 'Blackwell Packaging Yield Delay',
    severity: 'ELEVATED',
    description: 'Taiwan packaging facility reports 24-week delivery stretch on next-gen AI chip tranches. Tests hardware inventory resilience.',
  },
  {
    id: 'fomc_shock',
    title: 'Surprise 50bps Emergency Rate Cut',
    severity: 'MEDIUM',
    description: 'Central bank conducts inter-meeting 50bps policy easing. Tests duration immunization and yield curve inversion models.',
  },
  {
    id: 'apac_shipping',
    title: 'APAC Maritime Freight Insurance Spike (+45%)',
    severity: 'HIGH',
    description: 'Geopolitical strait tensions trigger maritime carrier surcharge. Tests gross leverage boundaries and supply chain AST ratios.',
  },
  {
    id: 'hyperscaler_capex',
    title: 'Hyperscaler CapEx Acceleration (+30% YoY)',
    severity: 'OPPORTUNITY',
    description: 'Cloud giants file unexpected SEC 8-K disclosures showing accelerated datacenter construction. Tests alpha momentum factor.',
  },
];

export const MarketShockSimulator: React.FC<MarketShockSimulatorProps> = ({
  isOpen,
  onClose,
  onExecuteShock,
  blueprintMode,
  themeMode = 'dark',
}) => {
  if (!isOpen) return null;

  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_SCENARIOS[0].id);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDetails, setCustomDetails] = useState<string>('');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [cascadeStep, setCascadeStep] = useState<number>(0);

  const isLight = themeMode === 'light' && !blueprintMode;

  const handleRunSimulation = () => {
    let title = '';
    let details = '';

    if (customTitle.trim()) {
      title = customTitle.trim();
      details = customDetails.trim() || 'Custom executive scenario injected into agent swarm.';
    } else {
      const preset = PRESET_SCENARIOS.find((p) => p.id === selectedPreset);
      if (preset) {
        title = preset.title;
        details = preset.description;
      }
    }

    setSimulating(true);
    soundFx.playShockAlert();

    // Step 1: Ground Floor
    setCascadeStep(1);
    setTimeout(() => {
      soundFx.playPacketPing(1);
      setCascadeStep(2); // Floor 1 Quant
    }, 800);

    setTimeout(() => {
      soundFx.playPacketPing(2);
      setCascadeStep(3); // Floor 2 Fundamental
    }, 1600);

    setTimeout(() => {
      soundFx.playPacketPing(3);
      setCascadeStep(4); // Floor 3 Risk
    }, 2400);

    setTimeout(() => {
      soundFx.playPacketPing(4);
      setCascadeStep(5); // Floor 4 Board Quorum
    }, 3200);

    setTimeout(() => {
      onExecuteShock(title, details);
      setSimulating(false);
      setCascadeStep(0);
      onClose();
    }, 4000);
  };

  return (
    <div 
      id="market-shock-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all ${
          blueprintMode 
            ? 'bg-[#050914] border-cyan-500/40 text-slate-100' 
            : isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
            : 'bg-[#080b12] border-slate-800 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-start justify-between pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-rose-500 mb-1 font-bold">
              <Zap className="w-4 h-4 animate-pulse" />
              <span>MACRO STRESS INJECTION ENGINE</span>
            </div>
            <h2 className={`text-xl font-bold font-['Cinzel',serif] ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Simulate Market Shock & Cascade
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Inject macro volatility or supply chain events down the skyscraper spine to trigger cross-floor consensus.
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 space-y-6">
          
          {/* Preset Scenarios */}
          <div className="space-y-3">
            <span className={`text-xs font-mono uppercase font-bold block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Preset Executive Scenarios
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_SCENARIOS.map((sc) => {
                const isSelected = selectedPreset === sc.id && !customTitle;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      soundFx.playClick(1300);
                      setSelectedPreset(sc.id);
                      setCustomTitle('');
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500/50 shadow-md scale-[1.01]'
                        : isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        : 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-rose-500 font-bold">{sc.severity}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                    </div>
                    <h4 className={`font-bold text-xs leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>{sc.title}</h4>
                    <p className={`text-[10px] mt-1 line-clamp-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{sc.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Scenario Input */}
          <div className="space-y-2">
            <span className={`text-xs font-mono uppercase font-bold block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Or Define Custom Scenario
            </span>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g., Sovereign debt downgrade or Sudden AI chip export embargo..."
              className={`w-full rounded-xl px-4 py-2.5 text-xs placeholder-slate-400 focus:outline-none focus:border-rose-500 font-mono border ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900'
                  : 'bg-slate-900/60 border-slate-700 text-white placeholder-slate-500'
              }`}
            />
          </div>

          {/* Live Cascade Progress Visualizer */}
          {simulating && (
            <div className={`p-4 rounded-2xl border space-y-3 animate-in fade-in ${
              isLight ? 'bg-slate-50 border-rose-300' : 'bg-black/60 border-rose-500/30'
            }`}>
              <span className="text-xs font-mono text-rose-500 font-bold flex items-center gap-1.5">
                <Activity className="w-4 h-4 animate-spin" />
                <span>CASCADE PROPAGATION ACROSS 5 FLOORS</span>
              </span>

              <div className="space-y-2 text-xs font-mono">
                <div className={`flex items-center gap-2 ${cascadeStep >= 1 ? 'text-emerald-500 font-bold' : isLight ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>{cascadeStep >= 1 ? '✓' : '○'}</span>
                  <span>F0: Ground Floor State Bus broadcasts shock packet</span>
                </div>
                <div className={`flex items-center gap-2 ${cascadeStep >= 2 ? 'text-emerald-500 font-bold' : isLight ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>{cascadeStep >= 2 ? '✓' : '○'}</span>
                  <span>F1: Quant Desk recalculates high-frequency volatility</span>
                </div>
                <div className={`flex items-center gap-2 ${cascadeStep >= 3 ? 'text-emerald-500 font-bold' : isLight ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>{cascadeStep >= 3 ? '✓' : '○'}</span>
                  <span>F2: Fundamental Desk audits 10-K component liabilities</span>
                </div>
                <div className={`flex items-center gap-2 ${cascadeStep >= 4 ? 'text-emerald-500 font-bold' : isLight ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>{cascadeStep >= 4 ? '✓' : '○'}</span>
                  <span>F3: Risk Office flags parametric VaR breach</span>
                </div>
                <div className={`flex items-center gap-2 ${cascadeStep >= 5 ? 'text-emerald-500 font-bold' : isLight ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>{cascadeStep >= 5 ? '✓' : '○'}</span>
                  <span>F4: Executive Board convenes quorum & executes resolution!</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <button
            onClick={onClose}
            disabled={simulating}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cancel
          </button>

          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/25 transition disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{simulating ? 'Simulating Cascade...' : 'Inject & Run Cascade'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
