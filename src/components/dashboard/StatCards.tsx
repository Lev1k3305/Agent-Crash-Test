import React from 'react';
import { Target, CheckCircle2, XCircle, AlertOctagon, Database } from 'lucide-react';

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
    <div className="space-y-2">
      {/* Real Persistence Status Header */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-300 font-mono">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            {isDbLoaded
              ? `LOCAL-FIRST SQLITE PERSISTENCE ACTIVE — data/agent_crash_test.db (${scenariosCount} scenarios, ${totalRuns} runs recorded)`
              : 'Connecting to local SQLite database...'}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
          Persistent Storage
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Test Runs */}
        <div className="bg-[#111722] border border-[#1E293B] rounded-xl p-4.5 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Target className="w-4 h-4 text-purple-400" />
              Total Test Runs
            </span>
            <span className="text-cyan-400 font-semibold">
              {hasRealRuns ? 'Live' : 'SQLite'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {hasRealRuns ? totalRuns : 0}
            </span>
            <span className="text-[10px] font-mono text-purple-400 uppercase">
              {hasRealRuns ? 'Persisted' : 'Ready'}
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Across {scenariosCount} configured test scenarios
          </div>
        </div>

        {/* Tests Passed */}
        <div className="bg-[#111722] border border-[#1E293B] rounded-xl p-4.5 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Tests Passed
            </span>
            <span className="text-emerald-400 font-semibold">
              {hasRealRuns ? `${passRate}%` : '—'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
              {passedRuns}
            </span>
            <span className="text-[10px] font-mono text-emerald-500/80 uppercase">
              Compliant
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Adhered to business policies
          </div>
        </div>

        {/* Tests Failed */}
        <div className="bg-[#111722] border border-[#1E293B] rounded-xl p-4.5 relative overflow-hidden group hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <XCircle className="w-4 h-4 text-rose-400" />
              Tests Failed
            </span>
            <span className="text-rose-400 font-semibold">
              {hasRealRuns ? `${failRate}%` : '—'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-400 font-mono tracking-tight">
              {failedRuns}
            </span>
            <span className="text-[10px] font-mono text-rose-500/80 uppercase">
              Deviations
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Adversarial override or policy breaches
          </div>
        </div>

        {/* Scenarios Configured */}
        <div className="bg-[#111722] border border-[#1E293B] rounded-xl p-4.5 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <AlertOctagon className="w-4 h-4 text-purple-400" />
              Active Scenarios
            </span>
            <span className="text-purple-400 font-semibold">
              Ready
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-purple-400 font-mono tracking-tight">
              {scenariosCount}
            </span>
            <span className="text-[10px] font-mono text-purple-400 uppercase">
              In Database
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Security, Business, Reliability vectors
          </div>
        </div>
      </div>
    </div>
  );
};
