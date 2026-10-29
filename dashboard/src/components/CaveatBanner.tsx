import React from 'react';
import { AlertTriangle, Info, ExternalLink } from 'lucide-react';

interface CaveatBannerProps {
  onOpenDetails?: () => void;
  compact?: boolean;
}

export const CaveatBanner: React.FC<CaveatBannerProps> = ({ onOpenDetails, compact = false }) => {
  if (compact) {
    return (
      <div className="bg-[#F2C66D]/10 border border-[#F2C66D]/30 px-3 py-2 rounded flex items-center justify-between gap-3 text-xs text-[#F2C66D]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#F2C66D]" />
          <span>
            <strong className="font-semibold">Supplementary-Source Audit Caveat:</strong> Official AMFI reports verified; RBI, NSE, money-market yield & tax panels lack retrieval-level audit metadata.
          </span>
        </div>
        {onOpenDetails && (
          <button
            onClick={onOpenDetails}
            className="underline hover:text-white cursor-pointer shrink-0 font-medium ml-2"
          >
            Review Audit Notes
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#F2C66D]/10 border border-[#F2C66D]/30 p-4 rounded-lg text-sm text-[#F2C66D] shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 text-[#F2C66D] mt-0.5" />
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#F2C66D] uppercase tracking-wider text-xs font-mono-code">
              Data Provenance & Audit Disclosure
            </span>
            {onOpenDetails && (
              <button
                onClick={onOpenDetails}
                className="text-xs text-[#F2C66D] hover:text-white flex items-center gap-1 cursor-pointer underline"
              >
                <span>Read Full Audit</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-xs text-[#A8C6C3] leading-relaxed">
            The fund-flow panel is built from 69 official monthly AMFI reports (Jan 2021 – Sep 2026), replacing erroneous initial baseline values. However, supplementary RBI policy rate, NSE volatility, 91-day T-bill proxy yield, and tax calendar CSVs lack retrieval-level checksums. Driver ablation metrics and yield-drag costs are qualified as empirical predictive comparisons, not audited causal effects.
          </p>
        </div>
      </div>
    </div>
  );
};
