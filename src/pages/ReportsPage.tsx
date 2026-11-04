import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  FileSpreadsheet, 
  FileCode,
  ShieldAlert
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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#F4F5F7]">Forensic Audit Reports</h2>
          <p className="text-xs text-[#9299A8] mt-0.5">
            Persisted test evaluation summaries with deterministic export (JSON / CSV)
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={isLoading}
          className="p-2 rounded-lg bg-[#131720] border border-white/[0.07] text-[#9299A8] hover:text-[#F4F5F7] transition-all cursor-pointer"
          title="Reload reports from SQLite"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#8B5CF6]' : ''}`} />
        </button>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={loadReports} className="px-2.5 py-1 rounded bg-[#EF4444]/20 text-white hover:bg-[#EF4444]/30">
            Retry
          </button>
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 && !isLoading ? (
        <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-[#697386] mx-auto opacity-50" />
          <div className="text-sm font-semibold text-[#F4F5F7]">No Reports Stored in Database</div>
          <p className="text-xs text-[#9299A8] max-w-sm mx-auto">
            When you create or execute a test run on the Test Runs page, a forensic audit report is automatically generated and saved into SQLite.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-[#131720] border border-white/[0.07] rounded-xl p-5 space-y-4 hover:border-white/[0.12] transition-enterprise"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#F4F5F7] font-semibold text-xs">
                    {report.run_number || `Run #${report.run_id}`}
                  </span>
                  <span className="text-[#697386]">·</span>
                  <span className="text-xs text-[#9299A8] truncate">{report.scenario_name || 'E-commerce Scenario'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                      report.result === 'PASSED'
                        ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                        : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
                    }`}
                  >
                    {report.result}
                  </span>
                  <button
                    onClick={(e) => handleDelete(report.id, e)}
                    title="Delete report"
                    className="text-[#697386] hover:text-[#EF4444] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="text-xs text-[#F4F5F7] leading-relaxed">
                {report.summary}
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#0E1118] border border-white/[0.04] text-xs">
                <div>
                  <span className="text-[#697386] text-[10px] uppercase block font-medium">Risk Score</span>
                  <span
                    className={`text-sm font-semibold font-mono ${
                      report.risk_score >= 70
                        ? 'text-[#EF4444]'
                        : report.risk_score >= 40
                        ? 'text-[#F59E0B]'
                        : 'text-[#22C55E]'
                    }`}
                  >
                    {report.risk_score} / 100
                  </span>
                </div>
                <div>
                  <span className="text-[#697386] text-[10px] uppercase block font-medium">Findings</span>
                  <span className="text-[#F4F5F7] text-sm font-semibold font-mono">
                    {report.findings_count} Issues
                  </span>
                </div>
              </div>

              {report.findings_summary && (
                <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[11px] leading-relaxed">
                  <strong>Findings:</strong> {report.findings_summary}
                </div>
              )}

              {/* Export actions */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-[#697386]">
                  {report.created_at?.slice(0, 19).replace('T', ' ')}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownload(report.id, 'json')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#191E29] hover:bg-[#202736] text-[#8B5CF6] text-xs font-mono transition-colors cursor-pointer"
                  >
                    <FileCode className="w-3 h-3 text-[#8B5CF6]" />
                    <span>JSON</span>
                  </button>
                  <button
                    onClick={() => handleDownload(report.id, 'csv')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#191E29] hover:bg-[#202736] text-[#60A5FA] text-xs font-mono transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-[#60A5FA]" />
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
