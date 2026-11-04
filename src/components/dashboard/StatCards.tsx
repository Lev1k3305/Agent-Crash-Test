import React from 'react';
import { Target, CheckCircle2, XCircle, ShieldAlert, Database } from 'lucide-react';

interface StatCardsProps {
  totalRuns: number;
  passedRuns: number;
  failedRuns: number;
  scenariosCount: number;
  isDbLoaded: boolean;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalRuns,
  passedRuns,
  failedRuns,
  scenariosCount,
  isDbLoaded,
}) => {
  const hasRealRuns = totalRuns > 0;
  const passRate = hasRealRuns ? Math.round((passedRuns / totalRuns) * 100) : 0;
  const failRate = hasRealRuns ? Math.round((failedRuns / totalRuns) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Real Persistence Status Header */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#131720] border border-white/[0.07] text-xs">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#8B5CF6] shrink-0" />
          <span className="text-[#9299A8]">
            {isDbLoaded
              ? `LOCAL-FIRST SQLITE PERSISTENCE ACTIVE — data/agent_crash_test.db (${scenariosCount} scenarios, ${totalRuns} runs recorded)`
              : 'Connecting to local SQLite database...'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-0.5 rounded font-medium">
          WAL Journal Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Test Runs */}
        <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.12] transition-enterprise">
          <div className="flex items-center justify-between text-[#9299A8] text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Target className="w-3.5 h-3.5 text-[#8B5CF6]" />
              Total Test Runs
            </span>
            <span className="text-[11px] font-mono text-[#697386]">
              {hasRealRuns ? 'Verified' : 'SQLite'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#F4F5F7] font-mono">
              {hasRealRuns ? totalRuns : 0}
            </span>
            <span className="text-[11px] font-mono text-[#9299A8]">
              {scenariosCount} scenarios
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/[0.04] text-[11px] text-[#697386]">
            Total executions in SQLite
          </div>
        </div>

        {/* Tests Passed */}
        <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.12] transition-enterprise">
          <div className="flex items-center justify-between text-[#9299A8] text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
              Tests Passed
            </span>
            <span className="text-[11px] font-mono text-[#22C55E]">
              {hasRealRuns ? `${passRate}%` : '—'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#22C55E] font-mono">
              {passedRuns}
            </span>
            <span className="text-[11px] text-[#9299A8]">
              Compliant
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/[0.04] text-[11px] text-[#697386]">
            Adhered to security policies
          </div>
        </div>

        {/* Tests Failed */}
        <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.12] transition-enterprise">
          <div className="flex items-center justify-between text-[#9299A8] text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <XCircle className="w-3.5 h-3.5 text-[#EF4444]" />
              Tests Failed
            </span>
            <span className="text-[11px] font-mono text-[#EF4444]">
              {hasRealRuns ? `${failRate}%` : '—'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#EF4444] font-mono">
              {failedRuns}
            </span>
            <span className="text-[11px] text-[#9299A8]">
              Breached
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/[0.04] text-[11px] text-[#697386]">
            Exfiltration or policy failure
          </div>
        </div>

        {/* Active Scenarios */}
        <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.12] transition-enterprise">
          <div className="flex items-center justify-between text-[#9299A8] text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-[#60A5FA]" />
              Active Scenarios
            </span>
            <span className="text-[11px] font-mono text-[#60A5FA]">
              Configured
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#F4F5F7] font-mono">
              {scenariosCount}
            </span>
            <span className="text-[11px] text-[#9299A8]">
              In database
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/[0.04] text-[11px] text-[#697386]">
            Security, Business & Reliability
          </div>
        </div>
      </div>
    </div>
  );
};
