import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  RefreshCw, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  Shield, 
  FileSpreadsheet, 
  FileCode,
  ArrowRight
} from 'lucide-react';
import { TestReport } from '../types';
import { fetchReports, deleteReport, getReportExportUrl } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<TestReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReports = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchReports();
      setReports(res.items);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load reports from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this report?')) return;
    try {
      await deleteReport(id);
      await loadReports();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleDownload = (id: number, format: 'json' | 'csv') => {
    const url = getReportExportUrl(id, format);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${id}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#8b5cf6]" />
            <h2 className="text-base font-bold text-white">Forensic Audit Reports</h2>
          </div>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Persisted test evaluation summaries with deterministic export (JSON / CSV)
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={isLoading}
          className="p-2 rounded-lg bg-[#111722] border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Reload reports from SQLite"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
        </button>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={loadReports} className="px-2.5 py-1 rounded bg-rose-900/60 text-white hover:bg-rose-800">
            Retry
          </button>
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 && !isLoading ? (
        <div className="bg-[#111722] border border-slate-800 rounded-2xl p-10 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="text-base font-bold text-white">No Reports Stored in Database</div>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            When you create or execute a test run on the Test Runs page, a forensic audit report is automatically generated and saved into SQLite.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-[#111722] border border-slate-800 rounded-xl p-5 space-y-4 hover:border-purple-500/40 transition-colors"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{report.run_number || `Run #${report.run_id}`}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-purple-300">{report.scenario_name || 'E-commerce Scenario'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      report.result === 'PASSED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {report.result}
                  </span>
                  <button
                    onClick={(e) => handleDelete(report.id, e)}
                    title="Delete report"
                    className="text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="text-slate-300 text-xs">
                {report.summary}
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#080B10] border border-slate-800/80">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Risk Score</span>
                  <span
                    className={`text-sm font-bold ${
                      report.risk_score >= 70
                        ? 'text-rose-400'
                        : report.risk_score >= 40
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {report.risk_score} / 100
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Findings</span>
                  <span className="text-white text-sm font-bold">
                    {report.findings_count} Issues
                  </span>
                </div>
              </div>

              {report.findings_summary && (
                <div className="p-2.5 rounded bg-rose-950/30 border border-rose-900/40 text-rose-300 text-[11px]">
                  <strong>Findings:</strong> {report.findings_summary}
                </div>
              )}

              {/* Export actions */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {report.created_at?.slice(0, 19).replace('T', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(report.id, 'json')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 text-[11px] transition-colors cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5 text-purple-400" />
                    <span>JSON</span>
                  </button>
                  <button
                    onClick={() => handleDownload(report.id, 'csv')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
