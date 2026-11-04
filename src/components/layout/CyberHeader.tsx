import React, { useState, useEffect } from 'react';
import { RefreshCw, Bell, User, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
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
      subtitle: 'Monitoring of business-agent reliability & security testing / Мониторинг тестирования бизнес-агентов на надёжность и безопасность',
    },
    scenarios: {
      title: 'Test Scenarios',
      subtitle: 'Library of adversarial stress-test scenarios and business policy verifications',
    },
    runs: {
      title: 'Test Runs',
      subtitle: 'Execution history, isolated sandbox sessions, and agent activity logs',
    },
    reports: {
      title: 'Reports & Forensic Evidence',
      subtitle: 'Deterministic audit reports, action timelines, screenshots, and security scoring',
    },
    'attack-library': {
      title: 'Attack Library',
      subtitle: 'Planned repository of prompt injections, jailbreaks, and business logic exploits (Phase 4)',
    },
    settings: {
      title: 'System Settings',
      subtitle: 'Infrastructure configuration, live database diagnostics, and environment metadata',
    },
  };

  const currentMeta = titles[currentPage];

  return (
    <header className="h-20 bg-[#0B0F19]/90 backdrop-blur-md border-b border-[#1E293B] px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold tracking-wider text-cyan-400">
            [ CYBER OPERATIONS CENTER ]
          </span>
          <span className="text-slate-600 font-mono text-xs">/</span>
          <span className="text-[11px] font-mono text-purple-400 font-medium capitalize">
            {currentPage}
          </span>
        </div>
        <div className="flex items-baseline gap-3 mt-0.5">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-purple-500 font-mono text-lg font-normal">/</span>
            {currentMeta.title}
          </h1>
          <span className="text-xs text-slate-400 hidden xl:inline-block font-normal truncate max-w-xl">
            {currentMeta.subtitle}
          </span>
        </div>
      </div>

      {/* Right Utility Controls */}
      <div className="flex items-center gap-4">
        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111722] border border-slate-800 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeString || 'Loading clock...'}</span>
        </div>

        {/* Backend Diagnostic Trigger */}
        <button
          onClick={onRefresh}
          disabled={status.isLoading}
          title="Query live /api/health and /api/ready endpoints"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111722] hover:bg-slate-800/80 border border-slate-800 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${status.isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Ping API</span>
          {status.latencyMs !== null && (
            <span className="text-[11px] text-cyan-400 font-mono">({status.latencyMs}ms)</span>
          )}
        </button>

        {/* Notification Icon */}
        <div className="relative">
          <button 
            className="w-9 h-9 rounded-lg bg-[#111722] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="System notifications: Phase 1 Foundation Active"
          >
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_#8b5cf6]" />
        </div>

        {/* User / Operator Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-900/60 to-cyan-950/60 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left text-xs font-mono">
            <div className="text-white font-medium">SecOps Admin</div>
            <div className="text-[10px] text-slate-400">ID: #0024</div>
          </div>
        </div>
      </div>
    </header>
  );
};
