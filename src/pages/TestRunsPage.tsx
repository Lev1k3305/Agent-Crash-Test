import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  X,
  FileText
} from 'lucide-react';
import { TestRun, TestScenario } from '../types';
import { fetchRuns, fetchScenarios, createRun, deleteRun, fetchRunDetails } from '../services/api';

export const TestRunsPage: React.FC = () => {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected run for timeline inspection
  const [selectedRun, setSelectedRun] = useState<(TestRun & { events: any[]; report?: any }) | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Create Run Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<number | ''>('');
  const [customRunNumber, setCustomRunNumber] = useState('');
  const [runResult, setRunResult] = useState<'PASSED' | 'FAILED' | 'INCONCLUSIVE'>('PASSED');
  const [riskScore, setRiskScore] = useState(15);
  const [durationSeconds, setDurationSeconds] = useState(12.4);
  const [runNotes, setRunNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [runsRes, scenariosRes] = await Promise.all([
        fetchRuns(),
        fetchScenarios(),
      ]);
      setRuns(runsRes.items);
      setScenarios(scenariosRes.items);
      if (scenariosRes.items.length > 0 && selectedScenarioId === '') {
        setSelectedScenarioId(scenariosRes.items[0].id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load test runs from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScenarioId) {
      setSubmitError('Please select a test scenario.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createRun({
        scenario_id: Number(selectedScenarioId),
        run_number: customRunNumber.trim() || undefined,
        status: 'COMPLETED',
        result: runResult,
        risk_score: Number(riskScore),
        duration_seconds: Number(durationSeconds),
        notes: runNotes.trim() || undefined,
        create_default_events: true,
        create_report: true,
      });
      setIsCreateOpen(false);
      setCustomRunNumber('');
      setRunNotes('');
      await loadData();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to record test run.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRun = async (id: number, runNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete test run ${runNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteRun(id);
      if (selectedRun?.id === id) {
        setSelectedRun(null);
      }
      await loadData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleInspectRun = async (id: number) => {
    setIsLoadingDetails(true);
    try {
      const details = await fetchRunDetails(id);
      setSelectedRun(details);
    } catch (err: any) {
      alert(`Failed to load run details: ${err.message}`);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#F4F5F7]">Test Execution History</h2>
          <p className="text-xs text-[#9299A8] mt-0.5">
            Audit logs and sandbox telemetry persisted permanently in SQLite
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-[#131720] border border-white/[0.07] text-[#9299A8] hover:text-[#F4F5F7] transition-all cursor-pointer"
            title="Reload from SQLite"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#8B5CF6]' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Test Run</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={loadData} className="px-2.5 py-1 rounded bg-[#EF4444]/20 text-white hover:bg-[#EF4444]/30">
            Retry
          </button>
        </div>
      )}

      {/* Runs Table or Empty State */}
      {runs.length === 0 && !isLoading ? (
        <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-12 text-center space-y-3">
          <PlayCircle className="w-10 h-10 text-[#697386] mx-auto opacity-50" />
          <div className="text-sm font-semibold text-[#F4F5F7]">No Test Runs Recorded Yet</div>
          <p className="text-xs text-[#9299A8] max-w-sm mx-auto">
            Test runs recorded here persist in SQLite across restarts.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Create First Test Run
          </button>
        </div>
      ) : (
        <div className="bg-[#131720] border border-white/[0.07] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.07] bg-[#0E1118] text-[#697386] text-[11px] font-medium uppercase tracking-wider">
                  <th className="py-3 px-4 font-mono">Run ID</th>
                  <th className="py-3 px-4">Scenario</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Events</th>
                  <th className="py-3 px-4">Started Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {runs.map((run) => (
                  <tr
                    key={run.id}
                    onClick={() => handleInspectRun(run.id)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-[#F4F5F7]">
                      {run.run_number}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#F4F5F7] font-medium">{run.scenario_name || `Scenario #${run.scenario_id}`}</span>
                      {run.scenario_code && (
                        <span className="ml-1.5 text-[10px] text-[#697386] font-mono">({run.scenario_code})</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
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
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      <span
                        className={
                          run.risk_score >= 70
                            ? 'text-[#EF4444]'
                            : run.risk_score >= 40
                            ? 'text-[#F59E0B]'
                            : 'text-[#22C55E]'
                        }
                      >
                        {run.risk_score}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#9299A8] font-mono">
                      {run.duration_seconds}s
                    </td>
                    <td className="py-3 px-4 text-[#9299A8]">
                      {run.events_count || 5} events
                    </td>
                    <td className="py-3 px-4 text-[#697386] text-[11px] font-mono">
                      {run.created_at?.slice(0, 19).replace('T', ' ')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectRun(run.id);
                          }}
                          className="px-2 py-1 rounded-md bg-[#191E29] text-[#8B5CF6] hover:bg-[#202736] transition-colors cursor-pointer"
                        >
                          Trace
                        </button>
                        <button
                          onClick={(e) => handleDeleteRun(run.id, run.run_number, e)}
                          title="Delete test run"
                          className="p-1 rounded text-[#697386] hover:text-[#EF4444] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Run Events Detail Modal */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#131720] border border-white/[0.1] rounded-xl max-w-2xl w-full p-6 relative space-y-4 shadow-xl">
            <button
              onClick={() => setSelectedRun(null)}
              className="absolute top-4 right-4 text-[#9299A8] hover:text-[#F4F5F7] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-[#F4F5F7]">
                {selectedRun.run_number} — Telemetry Audit Trace
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  selectedRun.result === 'PASSED'
                    ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                    : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
                }`}
              >
                {selectedRun.result}
              </span>
            </div>

            <div className="text-xs text-[#9299A8]">
              Scenario: <strong className="text-[#F4F5F7]">{selectedRun.scenario_name}</strong> · Risk Score:{' '}
              <strong className="text-[#60A5FA] font-mono">{selectedRun.risk_score}/100</strong>
            </div>

            {/* Event Timeline */}
            <div className="bg-[#0E1118] border border-white/[0.07] rounded-lg p-3.5 max-h-80 overflow-y-auto space-y-2">
              <div className="text-[11px] text-[#697386] font-medium uppercase mb-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Execution Events ({selectedRun.events.length})</span>
              </div>
              {selectedRun.events.map((evt: any) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-md bg-[#131720] border border-white/[0.04] flex items-start justify-between text-xs"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-[#8B5CF6] font-mono font-medium">#{evt.sequence_number}</span>
                    <div className="min-w-0">
                      <span className="text-[#697386] font-mono text-[11px] mr-1.5">[{evt.event_type}]</span>
                      <span className="text-[#F4F5F7]">{evt.message}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-medium uppercase shrink-0 ${
                      evt.status === 'SUCCESS'
                        ? 'text-[#22C55E]'
                        : evt.status === 'WARNING'
                        ? 'text-[#F59E0B]'
                        : 'text-[#EF4444]'
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Associated Report */}
            {selectedRun.report && (
              <div className="p-3 rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 text-xs">
                <div className="text-[#8B5CF6] font-medium mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Forensic Summary
                </div>
                <div className="text-[#F4F5F7]">{selectedRun.report.summary}</div>
                {selectedRun.report.findings_summary && (
                  <div className="text-[#EF4444] text-[11px] mt-1">{selectedRun.report.findings_summary}</div>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRun(null)}
                className="px-4 py-2 rounded-lg bg-[#191E29] hover:bg-[#202736] text-[#F4F5F7] text-xs font-medium cursor-pointer"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Run Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateRun}
            className="bg-[#131720] border border-white/[0.1] rounded-xl max-w-lg w-full p-6 relative space-y-4 text-xs shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <h3 className="text-sm font-semibold text-[#F4F5F7] flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-[#8B5CF6]" />
                Record Test Run
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-[#9299A8] hover:text-[#F4F5F7] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitError && (
              <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]">
                {submitError}
              </div>
            )}

            <div>
              <label className="block text-[#9299A8] mb-1">Target Scenario *</label>
              <select
                required
                value={selectedScenarioId}
                onChange={(e) => setSelectedScenarioId(Number(e.target.value))}
                className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg px-3 py-2 text-[#F4F5F7] focus:outline-none focus:border-[#8B5CF6]"
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#9299A8] mb-1">Run Identifier (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated (RUN-0001)"
                  value={customRunNumber}
                  onChange={(e) => setCustomRunNumber(e.target.value)}
                  className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg px-3 py-2 text-[#F4F5F7] font-mono focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-[#9299A8] mb-1">Result Outcome *</label>
                <select
                  value={runResult}
                  onChange={(e: any) => setRunResult(e.target.value)}
                  className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg px-3 py-2 text-[#F4F5F7] focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="PASSED">PASSED (Complied)</option>
                  <option value="FAILED">FAILED (Breached)</option>
                  <option value="INCONCLUSIVE">INCONCLUSIVE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#9299A8] mb-1">Risk Score (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={riskScore}
                  onChange={(e) => setRiskScore(Number(e.target.value))}
                  className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg px-3 py-2 text-[#F4F5F7] font-mono focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-[#9299A8] mb-1">Duration (Seconds)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(Number(e.target.value))}
                  className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg px-3 py-2 text-[#F4F5F7] font-mono focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#9299A8] mb-1">Execution Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="Agent behavior observations or error codes"
                value={runNotes}
                onChange={(e) => setRunNotes(e.target.value)}
                className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg px-3 py-2 text-[#F4F5F7] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="pt-3 border-t border-white/[0.07] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#191E29] hover:bg-[#202736] text-[#9299A8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium cursor-pointer"
              >
                {isSubmitting ? 'Saving to Database...' : 'Save Run to SQLite'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
