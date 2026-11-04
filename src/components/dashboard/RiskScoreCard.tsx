import React from 'react';
import { Shield, ChevronRight, AlertTriangle } from 'lucide-react';
import { TestScenario } from '../../types';

interface RiskScoreCardProps {
  scenarios: TestScenario[];
  onViewScenarios: () => void;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ scenarios, onViewScenarios }) => {
  const securityCount = scenarios.filter((s) => s.category?.toLowerCase() === 'security').length;
  const businessCount = scenarios.filter((s) => s.category?.toLowerCase() === 'business').length;
  const reliabilityCount = scenarios.filter((s) => s.category?.toLowerCase() === 'reliability').length;
  const criticalCount = scenarios.filter((s) => s.risk_level === 'Critical').length;
  const highCount = scenarios.filter((s) => s.risk_level === 'High').length;

  return (
    <div className="space-y-4">
      {/* 1. Scenario Breakdown Card */}
      <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.07] text-xs">
          <span className="font-semibold text-[#F4F5F7] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#8B5CF6]" />
            Scenario Distribution
          </span>
          <button
            onClick={onViewScenarios}
            className="text-[11px] text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-0.5 cursor-pointer font-medium"
          >
            <span>Manage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E1118] border border-white/[0.04]">
            <span className="text-[#9299A8]">Security Vectors</span>
            <span className="font-mono text-[#F4F5F7] font-semibold">{securityCount}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E1118] border border-white/[0.04]">
            <span className="text-[#9299A8]">Business Logic Checks</span>
            <span className="font-mono text-[#F4F5F7] font-semibold">{businessCount}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E1118] border border-white/[0.04]">
            <span className="text-[#9299A8]">Reliability & Idempotency</span>
            <span className="font-mono text-[#F4F5F7] font-semibold">{reliabilityCount}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#EF4444]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">{criticalCount} Critical Risk</span>
          </div>
          <span className="text-[11px] text-[#F59E0B] font-medium">{highCount} High Risk</span>
        </div>
      </div>

      {/* 2. Platform Reliability Baseline */}
      <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-5">
        <h4 className="text-xs font-semibold text-[#F4F5F7] uppercase tracking-wider mb-2 text-[#697386]">
          Testing Principles
        </h4>
        <p className="text-xs text-[#9299A8] leading-relaxed">
          Agent Crash Test executes agents against concrete database and API state in isolated test runs. Results reflect verifiable system modifications rather than conversational output.
        </p>
      </div>
    </div>
  );
};
