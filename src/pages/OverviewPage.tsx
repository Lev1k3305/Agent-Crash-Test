import React, { useState, useEffect } from 'react';
import { StatCards } from '../components/dashboard/StatCards';
import { SystemVisualizer } from '../components/dashboard/SystemVisualizer';
import { RiskScoreCard } from '../components/dashboard/RiskScoreCard';
import { NavPage, TestScenario, TestRun, TestReport } from '../types';
import { fetchScenarios, fetchRuns, fetchReports } from '../services/api';
import {
  PlayCircle,
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Layers,
  Shield
} from 'lucide-react';

interface OverviewPageProps {
  onNavigate: (page: NavPage) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [reports, setReports] = useState<TestReport[]>([]);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [scenariosRes, runsRes, reportsRes] = await Promise.all([
          fetchScenarios().catch(() => ({ items: [], total: 0 })),
          fetchRuns().catch(() => ({ items: [], total: 0 })),
          fetchReports().catch(() => ({ items: [], total: 0 })),
        ]);
        if (isMounted) {
          setScenarios(scenariosRes.items);
          setRuns(runsRes.items);
          setReports(reportsRes.items);
          setIsDbLoaded(true);
        }
      } catch {
        if (isMounted) setIsDbLoaded(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalRuns = runs.length;
  const passedRuns = runs.filter((r) => r.result === 'PASSED').length;
  const failedRuns = runs.filter((r) => r.result === 'FAILED').length;
  const scenariosCount = scenarios.length;

  return (
    <div className="space-y-6">
      {/* 1. Top Persistent SQLite Metric Cards */}
      <StatCards
        totalRuns={totalRuns}
        passedRuns={passedRuns}
        failedRuns={failedRuns}
        scenariosCount={scenariosCount}
        isDbLoaded={isDbLoaded}
      />

      {/* 2. Middle Grid: Left Topology & Recent Activity, Right Scenarios */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Topology + Recent Activity */}
        <div className="xl:col-span-8 space-y-6">
          <SystemVisualizer />

          {/* Recent Test Activity Section */}
          <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F5F7] flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-[#8B5CF6]" />
                  Recent Test Activity
                </h3>
                <p className="text-xs text-[#9299A8] mt-0.5">
                  Latest execution runs saved in SQLite database
                </p>
              </div>
              <button
                onClick={() => onNavigate('runs')}
                className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View all runs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {runs.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#697386]">
                <Clock className="w-8 h-8 text-[#697386] mx-auto mb-2 opacity-50" />
                No test runs recorded yet. Record a test execution in Test Runs.
              </div>
            ) : (
              <div className="mt-3 divide-y divide-white/[0.04]">
                {runs.slice(0, 5).map((run) => (
                  <div
                    key={run.id}
                    onClick={() => onNavigate('runs')}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-white/[0.02] px-2 rounded-lg cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-[#F4F5F7] font-medium">{run.run_number}</span>
                      <span className="text-[#9299A8] truncate">{run.scenario_name || `Scenario #${run.scenario_id}`}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                          run.result === 'PASSED'
                            ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                            : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
                        }`}
                      >
                        {run.result === 'PASSED' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {run.result}
                      </span>
                      <span className="text-[11px] font-mono text-[#697386] hidden sm:inline">
                        {run.duration_seconds}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Scenarios Distribution & Recent Reports */}
        <div className="xl:col-span-4 space-y-6">
          <RiskScoreCard
            scenarios={scenarios}
            onViewScenarios={() => onNavigate('scenarios')}
          />

          {/* Recent Reports Summary */}
          <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <h3 className="text-sm font-semibold text-[#F4F5F7] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#60A5FA]" />
                Recent Reports
              </h3>
              <button
                onClick={() => onNavigate('reports')}
                className="text-xs text-[#60A5FA] hover:text-[#93C5FD] font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>All reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#697386]">
                No forensic reports generated yet.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {reports.slice(0, 3).map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => onNavigate('reports')}
                    className="p-3 rounded-lg bg-[#0E1118] border border-white/[0.04] text-xs hover:border-white/[0.1] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#F4F5F7]">{rep.run_number || `Report #${rep.id}`}</span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          rep.result === 'PASSED' ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#EF4444] bg-[#EF4444]/10'
                        }`}
                      >
                        {rep.result}
                      </span>
                    </div>
                    <p className="text-[#9299A8] text-[11px] line-clamp-1">{rep.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
