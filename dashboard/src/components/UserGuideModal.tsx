import React from 'react';
import {
  X,
  BookOpen,
  LayoutDashboard,
  TrendingUp,
  ShieldCheck,
  FileBarChart2,
  Database,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: 'overview' | 'forecasts' | 'cash_buffer' | 'model_evidence' | 'data_method') => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1D5555] bg-[#103238]/60">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#00D4C3]" />
            <div>
              <h2 id="guide-title" className="text-base font-bold text-[#F2FBF9] font-heading">
                How to Use FlowGuard
              </h2>
              <p className="text-xs text-[#A8C6C3]">
                Fund Manager & Competition Judge Decision-Support Guide (Zeckathon PS 03)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close guide"
            className="p-1.5 rounded-lg text-[#A8C6C3] hover:text-white hover:bg-[#1D5555]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#A8C6C3]">
          {/* Quick Start 3-Step Flow */}
          <div className="bg-[#071216] border border-[#00D4C3]/30 rounded-lg p-4 space-y-3">
            <div className="text-xs font-mono-code font-bold text-[#48F0DE] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#00D4C3]" />
              Quick Workflow for Fund Managers & Judges
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#103238]/60 p-3 rounded border border-[#1D5555] space-y-1">
                <div className="font-bold text-[#F2FBF9] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#00D4C3]/20 text-[#00D4C3] flex items-center justify-center text-[10px]">1</span>
                  Review Forecasts
                </div>
                <p className="text-[#A8C6C3] leading-relaxed">
                  Check point net flows and 80%/95% confidence bands for Liquid and Overnight funds for Oct, Nov, and Dec 2026.
                </p>
              </div>

              <div className="bg-[#103238]/60 p-3 rounded border border-[#1D5555] space-y-1">
                <div className="font-bold text-[#F2FBF9] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#00D4C3]/20 text-[#00D4C3] flex items-center justify-center text-[10px]">2</span>
                  Set Cash Buffer
                </div>
                <p className="text-[#A8C6C3] leading-relaxed">
                  Use the recommended potential-outflow reserve (<code className="text-[#A9F2E7]">max(0, -lower 5% bound)</code>) to prevent 3x shortfall penalties.
                </p>
              </div>

              <div className="bg-[#103238]/60 p-3 rounded border border-[#1D5555] space-y-1">
                <div className="font-bold text-[#F2FBF9] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#00D4C3]/20 text-[#00D4C3] flex items-center justify-center text-[10px]">3</span>
                  Inspect Validation
                </div>
                <p className="text-[#A8C6C3] leading-relaxed">
                  Verify 24-month rolling backtests, interval calibration coverage, and driver ablations in Model Evidence.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Navigating the 5 Modules */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono-code uppercase tracking-wider text-[#F2FBF9] font-bold">
              Navigating the Dashboard Sections
            </h3>

            <div className="space-y-2.5">
              {/* Tab 1: Overview */}
              <div
                onClick={() => { onSelectTab?.('overview'); onClose(); }}
                className="bg-[#103238]/40 hover:bg-[#103238] border border-[#1D5555] p-3 rounded-lg flex items-start gap-3 transition-colors cursor-pointer group"
              >
                <LayoutDashboard className="w-5 h-5 text-[#00D4C3] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F2FBF9] text-xs font-heading group-hover:text-[#48F0DE]">
                      Overview
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A8C6C3] group-hover:text-[#48F0DE] transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-xs text-[#A8C6C3] mt-0.5 leading-relaxed">
                    Executive summary with live KPIs, the Q4 three-month forecast table, and an interactive historical timeline showing observed flows vs. uncertainty bands.
                  </p>
                </div>
              </div>

              {/* Tab 2: Forecasts */}
              <div
                onClick={() => { onSelectTab?.('forecasts'); onClose(); }}
                className="bg-[#103238]/40 hover:bg-[#103238] border border-[#1D5555] p-3 rounded-lg flex items-start gap-3 transition-colors cursor-pointer group"
              >
                <TrendingUp className="w-5 h-5 text-[#00D4C3] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F2FBF9] text-xs font-heading group-hover:text-[#48F0DE]">
                      Forecasts
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A8C6C3] group-hover:text-[#48F0DE] transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-xs text-[#A8C6C3] mt-0.5 leading-relaxed">
                    Filter by category (Liquid vs. Overnight) and horizon (1, 2, 3 months). Toggle the optional 6-month March 2027 Advance-Tax scenario. Inspect point predictions alongside 80% and 95% empirical quantiles.
                  </p>
                </div>
              </div>

              {/* Tab 3: Cash Buffer */}
              <div
                onClick={() => { onSelectTab?.('cash_buffer'); onClose(); }}
                className="bg-[#103238]/40 hover:bg-[#103238] border border-[#1D5555] p-3 rounded-lg flex items-start gap-3 transition-colors cursor-pointer group"
              >
                <ShieldCheck className="w-5 h-5 text-[#F2C66D] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F2FBF9] text-xs font-heading group-hover:text-[#48F0DE]">
                      Cash Buffer & Decision Cost
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A8C6C3] group-hover:text-[#48F0DE] transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-xs text-[#A8C6C3] mt-0.5 leading-relaxed">
                    Shows the potential-outflow reserve for each month. Compares policy performance against the prior-year same-month baseline over 24 evaluation months, demonstrating massive savings by eliminating 3x shortfall penalties.
                  </p>
                </div>
              </div>

              {/* Tab 4: Model Evidence */}
              <div
                onClick={() => { onSelectTab?.('model_evidence'); onClose(); }}
                className="bg-[#103238]/40 hover:bg-[#103238] border border-[#1D5555] p-3 rounded-lg flex items-start gap-3 transition-colors cursor-pointer group"
              >
                <FileBarChart2 className="w-5 h-5 text-[#00D4C3] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F2FBF9] text-xs font-heading group-hover:text-[#48F0DE]">
                      Model Evidence
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A8C6C3] group-hover:text-[#48F0DE] transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-xs text-[#A8C6C3] mt-0.5 leading-relaxed">
                    Transparent out-of-sample MAE/RMSE comparisons, interval empirical coverage vs. nominal target calibration, and driver ablations showing predictive lift vs. overfit degradation.
                  </p>
                </div>
              </div>

              {/* Tab 5: Data & Method */}
              <div
                onClick={() => { onSelectTab?.('data_method'); onClose(); }}
                className="bg-[#103238]/40 hover:bg-[#103238] border border-[#1D5555] p-3 rounded-lg flex items-start gap-3 transition-colors cursor-pointer group"
              >
                <Database className="w-5 h-5 text-[#00D4C3] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F2FBF9] text-xs font-heading group-hover:text-[#48F0DE]">
                      Data & Method
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A8C6C3] group-hover:text-[#48F0DE] transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-xs text-[#A8C6C3] mt-0.5 leading-relaxed">
                    Source documentation, SHA-256 verified AMFI archives vs. supplementary panels, data contract file schema, and step-by-step Python pipeline execution commands.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Guardrails Callout */}
          <div className="bg-[#071216] border border-[#F2C66D]/30 rounded-lg p-3.5 text-xs text-[#A8C6C3] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#F2C66D] font-mono-code font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              Key Competition Guardrails
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-[#A8C6C3]">
              <li><strong className="text-[#F2FBF9]">Units & Polarity:</strong> All financial values in <strong>₹ crore</strong>. Positive (+) means Net Inflow; negative (-) means Net Outflow.</li>
              <li><strong className="text-[#F2FBF9]">Advance-Tax (March 15):</strong> An advance-tax decision context modeled as a monthly aggregate, <em>not</em> a daily single-day forecast.</li>
              <li><strong className="text-[#F2FBF9]">Yield Proxy:</strong> Idle-cash yield drag is proxied by 91-day T-bills as no direct fund cash return series exists.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1D5555] bg-[#103238]/40 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#00D4C3] hover:bg-[#48F0DE] text-[#071216] font-semibold text-xs rounded transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
