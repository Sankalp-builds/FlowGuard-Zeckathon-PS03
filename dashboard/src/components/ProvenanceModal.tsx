import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, FileText, Database, ExternalLink } from 'lucide-react';
import { FORECAST_METADATA } from '../data/flowguardData.ts';

interface ProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProvenanceModal: React.FC<ProvenanceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="provenance-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1D5555] bg-[#103238]/60">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#F2C66D]" />
            <div>
              <h2 id="provenance-title" className="text-base font-bold text-[#F2FBF9] font-heading">
                Data Provenance & Audit Limitations
              </h2>
              <p className="text-xs text-[#A8C6C3]">
                Zeckathon PS 03 Competition Audit Documentation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close audit modal"
            className="p-1.5 rounded-lg text-[#A8C6C3] hover:text-white hover:bg-[#1D5555]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#A8C6C3]">
          {/* Section 1: Verified AMFI Panel */}
          <div className="bg-[#071216] border border-[#00D4C3]/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-[#48F0DE] font-semibold text-xs font-mono-code mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#00D4C3]" />
              PRIMARY SOURCE VERIFIED: AMFI FUND FLOW PANEL (69 MONTHS)
            </div>
            <p className="text-xs leading-relaxed text-[#F2FBF9]/90 mb-3">
              The core mutual fund flow panel was systematically rebuilt directly from official Association of Mutual Funds in India (AMFI) monthly report archives spanning <strong>January 2021 through September 2026</strong>.
            </p>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-[#A8C6C3]">
              <li>69 monthly reports and 138 Liquid and Overnight category rows archived in raw format.</li>
              <li>Every month includes source URLs and SHA-256 integrity checksums in the manifest.</li>
              <li>Net flow identities (<code className="text-[#A9F2E7]">Net Flow = Mobilized - Repurchased</code>) are mathematically validated within official rounding tolerances.</li>
              <li>
                <span className="text-[#00D4C3] font-medium">Critical Correction:</span> Erroneous March 2021 numbers in original baseline files were replaced with official AMFI values: Liquid (-₹19,383.68 cr) and Overnight (+₹5,027.15 cr).
              </li>
            </ul>
          </div>

          {/* Section 2: Supplementary Source Caveat */}
          <div className="bg-[#071216] border border-[#F2C66D]/40 rounded-lg p-4">
            <div className="flex items-center gap-2 text-[#F2C66D] font-semibold text-xs font-mono-code mb-2">
              <AlertTriangle className="w-4 h-4 text-[#F2C66D]" />
              SUPPLEMENTARY SOURCE LIMITATIONS (QUALIFIED FINDINGS)
            </div>
            <p className="text-xs leading-relaxed text-[#F2FBF9]/90 mb-3">
              Unlike the primary AMFI panel, the external market and economic panels (RBI policy rates, NSE Nifty returns & volatility, money-market yields, and tax calendar schedules) were supplied without row-level retrieval timestamps or cryptographic hashes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#103238]/60 p-3 rounded border border-[#1D5555]">
                <strong className="text-[#F2FBF9] block mb-1">Driver Ablations</strong>
                Driver findings (Rates, Liquidity, Equity, Calendar) reflect out-of-sample predictive comparisons against autoregressive benchmarks, not causal real-world mechanisms.
              </div>
              <div className="bg-[#103238]/60 p-3 rounded border border-[#1D5555]">
                <strong className="text-[#F2FBF9] block mb-1">Cash-Yield Proxy</strong>
                Because Indian mutual fund cash yields lack a direct return series, idle-cash yield drag is proxied using the prior-known 91-day T-bill yield.
              </div>
            </div>
          </div>

          {/* Section 3: Validation Methodology & Holdout Scope */}
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-[#F2FBF9] font-heading flex items-center gap-2">
              <Database className="w-4 h-4 text-[#00D4C3]" />
              Rolling-Origin Model Selection vs. Independent Holdout
            </h4>
            <p className="leading-relaxed">
              Model selection and reported evaluation metrics use the identical last-24-month rolling-origin evaluation folds (2024-10 to 2026-09). Consequently, reported MAE and RMSE metrics represent <strong>out-of-sample validation estimates</strong> rather than an isolated, untouched final holdout.
            </p>
            <p className="leading-relaxed">
              With 69 total monthly observations, extreme prediction interval tails (5th and 95th percentiles) have inherent sample uncertainty. Interval bounds use empirical residual quantiles from out-of-fold calibration.
            </p>
          </div>

          {/* Section 4: Advance-Tax Decision Context */}
          <div className="space-y-2 text-xs border-t border-[#1D5555] pt-4">
            <h4 className="font-semibold text-[#F2FBF9] font-heading flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00D4C3]" />
              Advance-Tax (March 15) Context Disclosure
            </h4>
            <p className="leading-relaxed">
              PS 03 refers to March 15 as an advance-tax decision milestone where corporate treasuries redeem liquid fund units to meet quarterly corporate tax obligations. <strong>This model operates exclusively at a monthly frequency</strong>. March 2027 forecasts represent monthly aggregates, not single-day March 15 or 5-day liquidity projections.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1D5555] bg-[#103238]/40 flex items-center justify-between">
          <div className="text-xs text-[#A8C6C3] font-mono-code">
            Release: {FORECAST_METADATA.data_as_of_month} (69 Months Panel)
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#00D4C3] hover:bg-[#48F0DE] text-[#071216] font-semibold text-xs rounded transition-colors cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
