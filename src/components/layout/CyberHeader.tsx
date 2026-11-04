import React, { useState, useEffect } from 'react';
import { RefreshCw, Bell, User, Clock, ChevronRight } from 'lucide-react';
import { NavPage, BackendStatusState } from '../../types';

interface CyberHeaderProps {
  currentPage: NavPage;
  status: BackendStatusState;
  onRefresh: () => void;
}

export const CyberHeader: React.FC<CyberHeaderProps> = ({
  currentPage,
  status,
  onRefresh,
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toUTCString().slice(5, 16);
      const timePart = now.toISOString().slice(11, 19);
      setTimeString(`UTC ${datePart} ${timePart}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const titles: Record<NavPage, { title: string; subtitle: string }> = {
    overview: {
      title: 'Overview',
      subtitle: 'Monitoring AI agent reliability, security posture, and runtime policy compliance.',
    },
    scenarios: {
      title: 'Test Scenarios',
      subtitle: 'Structured test cases for adversarial prompts, edge conditions, and policy verifications.',
    },
    runs: {
      title: 'Test Runs',
      subtitle: 'Execution logs, isolated sandbox sessions, and agent activity traces.',
    },
    reports: {
      title: 'Reports & Forensic Evidence',
      subtitle: 'Deterministic audit reports, action timelines, and security evaluations.',
    },
    'attack-library': {
      title: 'Attack Library',
      subtitle: 'Curated knowledge base of prompt injections, jailbreaks, and logic exploits.',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Local SQLite persistence controls, diagnostics telemetry, and system variables.',
    },
  };

  const currentMeta = titles[currentPage];

  return (
    <header className="h-16 bg-[#0B0D12]/90 backdrop-blur-md border-b border-white/[0.07] px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Breadcrumb Hierarchy */}
        <div className="flex items-center gap-1.5 text-xs text-[#9299A8]">
          <span className="font-semibold text-[#F4F5F7]">Platform</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#697386]" />
          <span className="capitalize text-[#8B5CF6] font-medium">{currentPage}</span>
        </div>

        {/* Retain operational tag for tests & audit clarity */}
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[#697386] hidden sm:inline">
          [ CYBER OPERATIONS CENTER ]
        </span>

        <div className="hidden md:block h-4 w-px bg-white/[0.1] mx-1" />

        <div className="hidden md:block">
          <span className="text-xs text-[#697386] truncate max-w-md block">
            {currentMeta.subtitle}
          </span>
        </div>
      </div>

      {/* Right Utility Controls */}
      <div className="flex items-center gap-3">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#131720] border border-white/[0.07] text-xs font-mono text-[#9299A8]">
          <Clock className="w-3 h-3 text-[#697386]" />
          <span>{timeString || 'Loading clock...'}</span>
        </div>

        {/* Backend Diagnostic Trigger */}
        <button
          onClick={onRefresh}
          disabled={status.isLoading}
          title="Query live /api/health and /api/ready endpoints"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#131720] hover:bg-[#191E29] border border-white/[0.07] text-xs font-sans text-[#F4F5F7] transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 text-[#8B5CF6] ${status.isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Ping API</span>
          {status.latencyMs !== null && (
            <span className="text-[10px] text-[#60A5FA] font-mono">({status.latencyMs}ms)</span>
          )}
        </button>

        {/* Notification Icon */}
        <button
          className="w-8 h-8 rounded-md bg-[#131720] border border-white/[0.07] flex items-center justify-center text-[#9299A8] hover:text-[#F4F5F7] hover:bg-[#191E29] transition-all cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
        </button>

        {/* User / Operator Menu */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/[0.07]">
          <div className="w-7 h-7 rounded-full bg-[#191E29] border border-white/[0.1] flex items-center justify-center text-[#F4F5F7]">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden sm:block text-left text-xs leading-none">
            <div className="text-[#F4F5F7] font-medium">SecOps Admin</div>
            <div className="text-[10px] text-[#697386] font-mono mt-0.5">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
