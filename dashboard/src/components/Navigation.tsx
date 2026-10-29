import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ShieldCheck,
  FileBarChart2,
  Database,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export type TabId = 'overview' | 'forecasts' | 'cash_buffer' | 'model_evidence' | 'data_method';

interface NavigationProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  mobileMenuOpen,
  onCloseMobileMenu,
}) => {
  const navItems: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'KPIs, Q4 forecasts & visual timeline',
    },
    {
      id: 'forecasts',
      label: 'Forecasts',
      icon: TrendingUp,
      description: '80%/95% prediction intervals & models',
    },
    {
      id: 'cash_buffer',
      label: 'Cash Buffer',
      icon: ShieldCheck,
      description: '95% potential outflow & 3x policy costs',
    },
    {
      id: 'model_evidence',
      label: 'Model Evidence',
      icon: FileBarChart2,
      description: 'Rolling 24M metrics & driver ablations',
    },
    {
      id: 'data_method',
      label: 'Data & Method',
      icon: Database,
      description: 'AMFI provenance, refresh guide & code',
    },
  ];

  const handleTabClick = (id: TabId) => {
    onSelectTab(id);
    onCloseMobileMenu();
  };

  return (
    <>
      {/* Desktop Navigation Rail */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0B2023] border-r border-[#1D5555] shrink-0 min-h-[calc(100vh-61px)]">
        <div className="p-4 space-y-1">
          <div className="text-[10px] font-mono-code uppercase tracking-wider text-[#A8C6C3] px-3 py-1 font-semibold">
            NAVIGATION
          </div>

          <nav className="space-y-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40 shadow-[0_0_12px_rgba(0,212,195,0.15)] font-bold'
                      : 'text-[#A8C6C3] hover:text-[#F2FBF9] hover:bg-[#103238]/50 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#00D4C3]' : 'text-[#A8C6C3] group-hover:text-[#48F0DE]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-heading font-semibold leading-tight">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-[#A8C6C3]/80 truncate">
                      {item.description}
                    </div>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#00D4C3]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Technical Spec Box */}
        <div className="mt-auto p-4 border-t border-[#1D5555]/60 text-xs font-mono-code text-[#A8C6C3] space-y-2">
          <div className="bg-[#071216] p-2.5 rounded border border-[#1D5555] text-[11px] space-y-1">
            <div className="flex items-center justify-between text-[#48F0DE]">
              <span>UNITS:</span>
              <strong className="text-[#F2FBF9]">₹ crore</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>PENALTY:</span>
              <strong className="text-[#F2C66D]">3.0x shortfall</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>YIELD PROXY:</span>
              <strong className="text-[#F2FBF9]">91d T-Bill</strong>
            </div>
          </div>
          <div className="text-[10px] text-[#A8C6C3]/70 text-center">
            Zeckathon PS 03 · Liquid & Overnight
          </div>
        </div>
      </aside>

      {/* Mobile Menu Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 md:hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={onCloseMobileMenu}
        >
          <div
            className="w-4/5 max-w-xs h-full bg-[#0B2023] border-r border-[#1D5555] p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="text-xs font-mono-code uppercase tracking-wider text-[#A8C6C3] font-semibold border-b border-[#1D5555] pb-2">
                FlowGuard Navigation
              </div>
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40 font-bold'
                          : 'text-[#A8C6C3] hover:text-[#F2FBF9] hover:bg-[#103238]/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00D4C3]' : 'text-[#A8C6C3]'}`} />
                      <div className="flex-1">
                        <div className="text-xs font-semibold">{item.label}</div>
                        <div className="text-[10px] text-[#A8C6C3]/80">{item.description}</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#A8C6C3]" />
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#1D5555] text-xs font-mono-code text-[#A8C6C3]">
              <div className="text-[11px] text-[#48F0DE]">
                Indian Liquid & Overnight Funds
              </div>
              <div className="text-[10px] text-[#A8C6C3] mt-1">
                Data through 2026-09 · 69 Months Active
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
