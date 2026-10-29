import React from 'react';
import { FORECAST_METADATA } from '../data/flowguardData.ts';
import { formatMonthName } from '../utils/formatters.ts';
import {
  ShieldAlert,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Menu,
  X,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface HeaderProps {
  onOpenAuditModal: () => void;
  onOpenUserGuide: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuditModal,
  onOpenUserGuide,
  mobileMenuOpen,
  onToggleMobileMenu,
  activeTab,
}) => {
  return (
    <header className="bg-[#0B2023] border-b border-[#1D5555] px-4 lg:px-6 py-3.5 sticky top-0 z-30 shadow-md">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Subtext */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Hamburger */}
          <button
            onClick={onToggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden p-1.5 rounded-lg text-[#A8C6C3] hover:text-white hover:bg-[#103238] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo Mark: Retro Pixel-Tech */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#071216] border border-[#00D4C3] flex items-center justify-center shadow-[0_0_12px_rgba(0,212,195,0.25)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D4C3]/20 to-transparent" />
              <span className="font-mono-code font-bold text-xs text-[#48F0DE] tracking-tighter">
                FG
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-[#F2FBF9] font-heading tracking-tight">
                  FlowGuard
                </span>
                <span className="text-[10px] font-mono-code uppercase px-1.5 py-0.2 rounded bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30">
                  PS 03
                </span>
              </div>
              <p className="text-[11px] text-[#A8C6C3] hidden sm:block">
                Monthly Fund-Flow Forecasting & Cash-Buffer Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right: Badges & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Data Vintage Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#071216] border border-[#1D5555] rounded-md text-xs font-mono-code text-[#A8C6C3]">
            <Calendar className="w-3.5 h-3.5 text-[#00D4C3]" />
            <span>Through: <strong className="text-[#F2FBF9]">{FORECAST_METADATA.data_as_of_month}</strong></span>
          </div>

          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#00D4C3]/10 border border-[#00D4C3]/30 rounded-md text-xs font-mono-code text-[#48F0DE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4C3] animate-pulse" />
            <span>AMFI Panel Active (69M)</span>
          </div>

          {/* User Guide Button */}
          <button
            onClick={onOpenUserGuide}
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-[#103238] hover:bg-[#1D5555] text-[#48F0DE] border border-[#00D4C3]/40 rounded-lg text-xs font-mono-code font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#00D4C3]" />
            <span className="hidden md:inline">How to Use</span>
            <span className="md:hidden">Guide</span>
          </button>

          {/* Provenance Audit Trigger */}
          <button
            onClick={onOpenAuditModal}
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-[#F2C66D]/15 hover:bg-[#F2C66D]/25 text-[#F2C66D] border border-[#F2C66D]/40 rounded-lg text-xs font-mono-code font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Audit Caveat</span>
            <span className="md:hidden">Audit</span>
          </button>
        </div>
      </div>
    </header>
  );
};

