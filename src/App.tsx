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

        <main className="flex-1 p-6 lg:p-8 max-w-[1500px] w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
