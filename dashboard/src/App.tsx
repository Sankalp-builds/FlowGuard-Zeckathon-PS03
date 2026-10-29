import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { Navigation, TabId } from './components/Navigation.tsx';
import { OverviewView } from './components/OverviewView.tsx';
import { ForecastsView } from './components/ForecastsView.tsx';
import { CashBufferView } from './components/CashBufferView.tsx';
import { ModelEvidenceView } from './components/ModelEvidenceView.tsx';
import { DataMethodView } from './components/DataMethodView.tsx';
import { ProvenanceModal } from './components/ProvenanceModal.tsx';
import { UserGuideModal } from './components/UserGuideModal.tsx';
import { FORECAST_METADATA } from './data/flowguardData.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [auditModalOpen, setAuditModalOpen] = useState<boolean>(false);
  const [userGuideOpen, setUserGuideOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#071216] text-[#F2FBF9] flex flex-col font-sans selection:bg-[#00D4C3]/20 selection:text-[#48F0DE]">
      {/* Top Bar Header */}
      <Header
        onOpenAuditModal={() => setAuditModalOpen(true)}
        onOpenUserGuide={() => setUserGuideOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        activeTab={activeTab}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[1720px] w-full mx-auto">
        {/* Navigation Rail / Sidebar */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Main Title Banner */}
          <div className="mb-6 pb-4 border-b border-[#1D5555]/60 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#F2FBF9] font-heading tracking-tight flex items-center gap-2.5">
                <span>Monthly Liquidity Outlook</span>
                <span className="text-xs font-mono-code font-normal text-[#48F0DE] px-2 py-0.5 rounded bg-[#00D4C3]/10 border border-[#00D4C3]/30 hidden sm:inline-block">
                  Liquid & Overnight
                </span>
              </h1>
              <p className="text-xs text-[#A8C6C3] mt-1 max-w-3xl leading-relaxed">
                Empirical fund-flow forecasting, prediction uncertainty bounds, and potential-outflow cash buffers designed for Indian mutual fund liquidity decision support (Zeckathon PS 03).
              </p>
            </div>

            <div className="text-[11px] font-mono-code text-[#A8C6C3] self-start sm:self-auto shrink-0">
              Reporting Month: <span className="text-[#F2FBF9] font-bold">{FORECAST_METADATA.data_as_of_month}</span>
            </div>
          </div>

          {/* Render Active View */}
          {activeTab === 'overview' && (
            <OverviewView
              onOpenAuditModal={() => setAuditModalOpen(true)}
              onNavigateToForecasts={() => setActiveTab('forecasts')}
              onNavigateToCashBuffer={() => setActiveTab('cash_buffer')}
            />
          )}

          {activeTab === 'forecasts' && <ForecastsView />}

          {activeTab === 'cash_buffer' && <CashBufferView />}

          {activeTab === 'model_evidence' && <ModelEvidenceView />}

          {activeTab === 'data_method' && (
            <DataMethodView onOpenAuditModal={() => setAuditModalOpen(true)} />
          )}
        </main>
      </div>

      {/* Audit & Provenance Modal */}
      <ProvenanceModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />

      {/* How to Use / User Guide Modal */}
      <UserGuideModal
        isOpen={userGuideOpen}
        onClose={() => setUserGuideOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
