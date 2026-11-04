import React from 'react';
import { Shield, ChevronRight, AlertTriangle, HelpCircle } from 'lucide-react';
import { NavPage } from '../../types';

interface RiskScoreCardProps {
  onViewScenarios: () => void;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ onViewScenarios }) => {
  const subMetrics = [
    { label: 'Behavior Control', score: 80, color: 'text-purple-400', bar: 'bg-purple-500' },
    { label: 'Policy Compliance', score: 75, color: 'text-indigo-400', bar: 'bg-indigo-500' },
    { label: 'Data Safety', score: 68, color: 'text-cyan-400', bar: 'bg-cyan-500' },
    { label: 'Error Handling', score: 70, color: 'text-blue-400', bar: 'bg-blue-500' },
    { label: 'Agent Reliability', score: 67, color: 'text-purple-300', bar: 'bg-purple-400' },
  ];

  const scenarioCounts = [
    { name: 'Prompt Injection', count: 2, severity: 'rose' },
    { name: 'Wrong Customer', count: 1, severity: 'amber' },
    { name: 'Duplicate Refund', count: 1, severity: 'amber' },
    { name: 'API Failure', count: 0, severity: 'slate' },
    { name: 'Policy Violation', count: 1, severity: 'amber' },
    { name: 'Data Leakage', count: 0, severity: 'slate' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Risk Score Card */}
      <div className="bg-[#111722] border border-[#1E293B] rounded-xl p-5 relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold text-purple-400">
            <Shield className="w-4 h-4 text-purple-400" />
            Composite Risk Score
          </span>
          <span className="text-[10px] text-purple-300 font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30">
            Demo Benchmark
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-4xl font-extrabold text-white">72</span>
              <span className="text-slate-400 text-sm font-semibold">/ 100</span>
            </div>
            <div className="text-[11px] text-amber-400 font-mono mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Elevated Risk Threshold
            </div>
          </div>

          {/* Mini Pentagon / Radar visualization */}
          <div className="w-20 h-20 relative flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-purple-500/30">
              {/* Outer guide polygon */}
              <polygon
                points="50,10 90,38 75,85 25,85 10,38"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Internal score polygon */}
              <polygon
                points="50,22 80,42 68,78 32,78 20,42"
                fill="rgba(139, 92, 246, 0.25)"
                stroke="#8B5CF6"
                strokeWidth="2"
              />
              {/* Center point */}
              <circle cx="50" cy="50" r="2.5" fill="#38BDF8" />
            </svg>
          </div>
        </div>

        {/* Sub-metrics breakdown */}
        <div className="mt-4 space-y-2 pt-3 border-t border-slate-800 text-xs font-mono">
          {subMetrics.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">{item.label}</span>
                <span className={`font-semibold ${item.color}`}>{item.score}</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.bar}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Test Scenarios Quick List */}
      <div className="bg-[#111722] border border-[#1E293B] rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
          <span className="font-semibold text-slate-300">Test Scenarios</span>
          <button
            onClick={onViewScenarios}
            className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 space-y-2 text-xs font-mono">
          {scenarioCounts.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between p-2 rounded-lg bg-[#0B0F19]/60 border border-slate-800/60 hover:border-purple-500/30 transition-colors"
            >
              <span className="text-slate-300">{s.name}</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  s.count > 0
                    ? s.severity === 'rose'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700/60'
                }`}
              >
                {s.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
