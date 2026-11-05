import React, { useState } from 'react';
import { CyberSidebar } from './components/layout/CyberSidebar';
import { CyberHeader } from './components/layout/CyberHeader';
import { OverviewPage } from './pages/OverviewPage';
import { TestScenariosPage } from './pages/TestScenariosPage';
import { TestRunsPage } from './pages/TestRunsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AttackLibraryPage } from './pages/AttackLibraryPage';
import { SettingsPage } from './pages/SettingsPage';
import { useBackendStatus } from './hooks/useBackendStatus';
import { NavPage } from './types';
import { AlertCircle, Terminal, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('overview');
  const { status, refreshStatus } = useBackendStatus(10000);

  const renderContent = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage onNavigate={(page) => setCurrentPage(page)} />;
      case 'scenarios':
        return <TestScenariosPage />;
      case 'runs':
        return <TestRunsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'attack-library':
        return <AttackLibraryPage />;
      case 'settings':
        return <SettingsPage status={status} onRefresh={refreshStatus} />;
      default:
        return <OverviewPage onNavigate={(page) => setCurrentPage(page)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F4F5F7] flex flex-row selection:bg-[#8B5CF6]/30 selection:text-white">
      {/* Persistent Left Sidebar */}
      <CyberSidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        status={status}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <CyberHeader
          currentPage={currentPage}
          status={status}
          onRefresh={refreshStatus}
        />

        {/* Informative Local Backend Offline Alert */}
        {status.apiStatus === 'disconnected' && (
          <div className="bg-[#EF4444]/10 border-b border-[#EF4444]/20 px-6 py-2.5 flex items-center justify-between text-xs text-[#F4F5F7]">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
              <span className="font-semibold text-[#EF4444]">Local Backend Offline:</span>
              <span className="text-[#9299A8] truncate">
                FastAPI is not reachable at <code className="text-[#F4F5F7] font-mono">http://127.0.0.1:8000</code>. Start backend locally to enable live SQLite persistence.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <span className="hidden md:inline font-mono text-[11px] text-[#697386] bg-black/30 px-2 py-0.5 rounded border border-white/5">
                <Terminal className="w-3 h-3 inline mr-1 text-[#8B5CF6]" />
                python -m uvicorn backend.app.main:app --port 8000
              </span>
              <button
                onClick={refreshStatus}
                className="px-2 py-1 rounded bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] font-medium text-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${status.isLoading ? 'animate-spin' : ''}`} />
                Retry
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-6 lg:p-8 max-w-[1500px] w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
