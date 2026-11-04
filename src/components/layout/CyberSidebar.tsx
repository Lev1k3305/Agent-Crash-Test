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
  Database
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
    { id: 'attack-library', label: 'Attack Library', icon: <Crosshair className="w-4 h-4" />, badge: 'Catalog' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#0E1118] border-r border-white/[0.07] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-white/[0.07] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
            <Shield className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div>
            <div className="font-semibold text-[#F4F5F7] text-sm tracking-tight flex items-center gap-1.5">
              <span>Agent Crash Test</span>
            </div>
            <div className="text-[11px] text-[#9299A8] font-normal leading-tight">
              AI Agent Reliability & Security
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#697386]">
            Platform
          </div>
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#191E29] text-[#F4F5F7] border border-white/[0.1] shadow-xs'
                    : 'text-[#9299A8] hover:text-[#F4F5F7] hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#8B5CF6]' : 'text-[#9299A8]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-[#9299A8]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Panel */}
      <div className="p-3 m-3 rounded-xl bg-[#131720] border border-white/[0.07]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider text-[#697386] font-semibold flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#60A5FA]" />
            System Status
          </span>
          <span className="text-[10px] font-mono text-[#9299A8]">v1.0</span>
        </div>

        <div className="space-y-1.5 text-xs">
          {/* Database Status */}
          <div className="flex items-center justify-between py-0.5" title="Authoritative SQLite status">
            <span className="text-[#9299A8] flex items-center gap-1.5">
              <Database className="w-3 h-3 text-[#697386]" />
              Database
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status.dbStatus === 'connected'
                    ? 'bg-[#22C55E]'
                    : status.dbStatus === 'checking'
                    ? 'bg-[#60A5FA] animate-pulse'
                    : 'bg-[#EF4444]'
                }`}
              />
              <span
                className={`capitalize text-[11px] font-medium ${
                  status.dbStatus === 'connected'
                    ? 'text-[#22C55E]'
                    : status.dbStatus === 'checking'
                    ? 'text-[#60A5FA]'
                    : 'text-[#EF4444]'
                }`}
              >
                {status.dbStatus}
              </span>
            </span>
          </div>

          {/* Backend API Status */}
          <div className="flex items-center justify-between py-0.5" title="Authoritative FastAPI status">
            <span className="text-[#9299A8] flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#697386]" />
              API Service
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status.apiStatus === 'healthy'
                    ? 'bg-[#22C55E]'
                    : status.apiStatus === 'checking'
                    ? 'bg-[#60A5FA] animate-pulse'
                    : 'bg-[#EF4444]'
                }`}
              />
              <span
                className={`capitalize text-[11px] font-medium ${
                  status.apiStatus === 'healthy'
                    ? 'text-[#22C55E]'
                    : status.apiStatus === 'checking'
                    ? 'text-[#60A5FA]'
                    : 'text-[#EF4444]'
                }`}
              >
                {status.apiStatus === 'healthy' ? 'Healthy' : status.apiStatus}
              </span>
            </span>
          </div>
        </div>

        {/* Latency info */}
        {status.latencyMs !== null && (
          <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-[#697386]">
            <span>Response Latency</span>
            <span className="font-mono text-[#9299A8]">{status.latencyMs}ms</span>
          </div>
        )}
      </div>
    </aside>
  );
};
