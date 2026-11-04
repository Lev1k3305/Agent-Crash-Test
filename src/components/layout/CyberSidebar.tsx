import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  PlayCircle, 
  FileText, 
  Crosshair, 
  Settings as SettingsIcon,
  Shield,
  Activity,
  Database,
  Cpu,
  Layers
} from 'lucide-react';
import { NavPage, BackendStatusState } from '../../types';

interface CyberSidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  status: BackendStatusState;
}

export const CyberSidebar: React.FC<CyberSidebarProps> = ({
  currentPage,
  onNavigate,
  status,
}) => {
  const navItems: { id: NavPage; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'scenarios', label: 'Test Scenarios', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'runs', label: 'Test Runs', icon: <PlayCircle className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'attack-library', label: 'Attack Library', icon: <Crosshair className="w-4 h-4" />, badge: 'Phase 4' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-[#1E293B] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1E293B] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 cyber-glow-purple">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
              <span>Agent Crash Test</span>
            </div>
            <div className="text-[11px] text-purple-400/80 tracking-wider uppercase font-medium">
              AI Agent Reliability & Security
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer text-left ${
                  isActive
                    ? 'bg-purple-950/50 text-white border border-purple-500/30 shadow-[0_0_15px_-3px_rgba(139,92,246,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-purple-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Panel */}
      <div className="p-4 border-t border-[#1E293B] bg-[#080B10]/60 m-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            System Status
          </span>
          <span className="text-[10px] font-mono text-slate-400">Phase 1</span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          {/* AI Engine Status */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-slate-400" />
              AI Engine
            </span>
            <span className="text-emerald-400 font-medium">Online</span>
          </div>

          {/* Sandbox Status */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-slate-400" />
              Sandbox
            </span>
            <span className="text-cyan-400 font-medium">Isolated</span>
          </div>

          {/* Database Status (REAL) */}
          <div className="flex items-center justify-between" title="Live PostgreSQL 16 connection state">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Database className="w-3 h-3 text-slate-400" />
              Database
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status.dbStatus === 'connected'
                    ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                    : status.dbStatus === 'checking'
                    ? 'bg-cyan-400 animate-pulse'
                    : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                }`}
              />
              <span
                className={`capitalize font-medium ${
                  status.dbStatus === 'connected'
                    ? 'text-emerald-400'
                    : status.dbStatus === 'checking'
                    ? 'text-cyan-400'
                    : 'text-rose-400'
                }`}
              >
                {status.dbStatus}
              </span>
            </span>
          </div>

          {/* Backend API Status (REAL) */}
          <div className="flex items-center justify-between" title="Live FastAPI health check state">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-slate-400" />
              Backend API
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status.apiStatus === 'healthy'
                    ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                    : status.apiStatus === 'checking'
                    ? 'bg-cyan-400 animate-pulse'
                    : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                }`}
              />
              <span
                className={`capitalize font-medium ${
                  status.apiStatus === 'healthy'
                    ? 'text-emerald-400'
                    : status.apiStatus === 'checking'
                    ? 'text-cyan-400'
                    : 'text-rose-400'
                }`}
              >
                {status.apiStatus === 'healthy' ? 'Healthy' : status.apiStatus}
              </span>
            </span>
          </div>
        </div>

        {/* Footer Version */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>v1.0.0 (Foundation)</span>
          {status.latencyMs !== null && (
            <span className="text-cyan-400">{status.latencyMs}ms</span>
          )}
        </div>
      </div>
    </aside>
  );
};
