import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Layers, 
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
    <div className="space-y-6 font-mono text-xs">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
            <h2 className="text-base font-bold text-white">Persistent Test Runs</h2>
          </div>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Test run history saved permanently in local SQLite database (data/agent_crash_test.db)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-[#111722] border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reload from SQLite"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Test Run</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={loadData} className="px-2.5 py-1 rounded bg-rose-900/60 text-white hover:bg-rose-800">
            Retry
          </button>
        </div>
      )}

      {/* Runs Table or Empty State */}
      {runs.length === 0 && !isLoading ? (
        <div className="bg-[#111722] border border-slate-800 rounded-2xl p-10 text-center space-y-4">
          <PlayCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="text-base font-bold text-white">No Test Runs Recorded Yet</div>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Test runs created here are saved directly to SQLite and will persist across browser refreshes and system restarts.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create First Test Run
          </button>
        </div>
      ) : (
        <div className="bg-[#111722] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0B0F19] text-slate-400 text-[11px] uppercase">
                  <th className="py-3 px-4">Run #</th>
                  <th className="py-3 px-4">Scenario</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Events</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {runs.map((run) => (
                  <tr
                    key={run.id}
                    onClick={() => handleInspectRun(run.id)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-bold text-white">
                      {run.run_number}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-purple-300 font-medium">{run.scenario_name || `Scenario #${run.scenario_id}`}</span>
                      {run.scenario_code && (
                        <span className="ml-1.5 text-[10px] text-slate-500 font-mono">({run.scenario_code})</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          run.result === 'PASSED'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
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
                    <td className="py-3 px-4 font-bold">
                      <span
                        className={
                          run.risk_score >= 70
                            ? 'text-rose-400'
                            : run.risk_score >= 40
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {run.risk_score}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {run.duration_seconds}s
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {run.events_count || 5} events
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {run.created_at?.slice(0, 19).replace('T', ' ')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectRun(run.id);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 text-purple-300 hover:bg-slate-700 cursor-pointer"
                        >
                          View Events
                        </button>
                        <button
                          onClick={(e) => handleDeleteRun(run.id, run.run_number, e)}
                          title="Delete test run"
                          className="p-1 rounded text-slate-500 hover:text-rose-400 cursor-pointer"
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

      {/* Run Events Detail Drawer / Modal */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111722] border border-purple-500/40 rounded-2xl max-w-2xl w-full p-6 relative cyber-glow-purple space-y-4">
            <button
              onClick={() => setSelectedRun(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-white">
                {selectedRun.run_number} — Telemetry Audit Trace
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedRun.result === 'PASSED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {selectedRun.result}
              </span>
            </div>

            <div className="text-xs text-slate-400">
              Scenario: <strong className="text-white">{selectedRun.scenario_name}</strong> · Risk Score:{' '}
              <strong className="text-cyan-400">{selectedRun.risk_score}/100</strong>
            </div>

            {/* Event Timeline */}
            <div className="bg-[#080B10] border border-slate-800 rounded-xl p-4 max-h-80 overflow-y-auto space-y-2">
              <div className="text-[11px] text-cyan-400 font-semibold uppercase mb-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Persisted Execution Events ({selectedRun.events.length})</span>
              </div>
              {selectedRun.events.map((evt: any) => (
                <div
                  key={evt.id}
                  className="p-2 rounded bg-[#111722] border border-slate-800/80 flex items-start justify-between text-xs font-mono"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">#{evt.sequence_number}</span>
                    <div>
                      <span className="text-slate-400 font-semibold mr-1.5">[{evt.event_type}]</span>
                      <span className="text-white">{evt.message}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold shrink-0 ${
                      evt.status === 'SUCCESS'
                        ? 'text-emerald-400'
                        : evt.status === 'WARNING'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Associated Report */}
            {selectedRun.report && (
              <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/20 text-xs">
                <div className="text-purple-300 font-bold mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Forensic Report
                </div>
                <div className="text-slate-300">{selectedRun.report.summary}</div>
                {selectedRun.report.findings_summary && (
                  <div className="text-rose-400 mt-1">{selectedRun.report.findings_summary}</div>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRun(null)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Run Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateRun}
            className="bg-[#111722] border border-purple-500/40 rounded-2xl max-w-lg w-full p-6 relative cyber-glow-purple space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-purple-400" />
                Record Test Run to SQLite
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="p-2.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300">
                {submitError}
              </div>
            )}

            <div>
              <label className="block text-slate-400 mb-1">Target Scenario *</label>
              <select
                required
                value={selectedScenarioId}
                onChange={(e) => setSelectedScenarioId(Number(e.target.value))}
                className="w-full bg-[#080B10] border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
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
                <label className="block text-slate-400 mb-1">Run Identifier (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if blank (e.g. RUN-0001)"
                  value={customRunNumber}
                  onChange={(e) => setCustomRunNumber(e.target.value)}
                  className="w-full bg-[#080B10] border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Result Outcome *</label>
                <select
                  value={runResult}
                  onChange={(e: any) => setRunResult(e.target.value)}
                  className="w-full bg-[#080B10] border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="PASSED">PASSED (Complied)</option>
                  <option value="FAILED">FAILED (Policy/Security Breach)</option>
                  <option value="INCONCLUSIVE">INCONCLUSIVE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Risk Score (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={riskScore}
                  onChange={(e) => setRiskScore(Number(e.target.value))}
                  className="w-full bg-[#080B10] border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Duration (Seconds)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(Number(e.target.value))}
                  className="w-full bg-[#080B10] border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Execution Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="Agent behavior observations or error codes"
                value={runNotes}
                onChange={(e) => setRunNotes(e.target.value)}
                className="w-full bg-[#080B10] border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium cursor-pointer"
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
