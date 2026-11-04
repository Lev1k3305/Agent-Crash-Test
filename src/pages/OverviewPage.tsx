import React, { useState, useEffect } from 'react';
import { StatCards } from '../components/dashboard/StatCards';
import { SystemVisualizer } from '../components/dashboard/SystemVisualizer';
import { RiskScoreCard } from '../components/dashboard/RiskScoreCard';
import { LiveTracePreview } from '../components/dashboard/LiveTracePreview';
import { WorkflowBanner } from '../components/dashboard/WorkflowBanner';
import { NavPage, TestScenario, TestRun } from '../types';
import { fetchScenarios, fetchRuns } from '../services/api';

interface OverviewPageProps {
  onNavigate: (page: NavPage) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [scenariosRes, runsRes] = await Promise.all([
          fetchScenarios().catch(() => ({ items: [], total: 0 })),
          fetchRuns().catch(() => ({ items: [], total: 0 })),
        ]);
        if (isMounted) {
          setScenarios(scenariosRes.items);
          setRuns(runsRes.items);
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

      {/* 2. Middle Grid: Left Topology & Trace, Right Risk Score */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Top Topology + Bottom Trace Preview */}
        <div className="xl:col-span-8 space-y-6">
          <SystemVisualizer />
          <LiveTracePreview />
        </div>

        {/* Right Column (4 cols): Risk Score & Scenario Distribution */}
        <div className="xl:col-span-4">
          <RiskScoreCard onViewScenarios={() => onNavigate('scenarios')} />
        </div>
      </div>

      {/* 3. Bottom 5-Step Workflow Banner */}
      <WorkflowBanner />
    </div>
  );
};
