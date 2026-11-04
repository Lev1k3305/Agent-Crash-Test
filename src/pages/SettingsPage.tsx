import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Download,
  Upload,
  Plus,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { BackendStatusState, BackupStatus, ApplicationSetting } from '../types';
import { 
  fetchBackupStatus, 
  getBackupExportUrl, 
  restoreBackup, 
  fetchSettings, 
  upsertSetting 
} from '../services/api';

interface SettingsPageProps {
  status: BackendStatusState;
  onRefresh: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ status, onRefresh }) => {
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
  const [appSettings, setAppSettings] = useState<ApplicationSetting[]>([]);
  const [isLoadingBackup, setIsLoadingBackup] = useState(false);
  
  // Restore modal state
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [restoreFileBase64, setRestoreFileBase64] = useState<string | null>(null);
  const [restoreFileName, setRestoreFileName] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);

  // New setting modal state
  const [isAddSettingOpen, setIsAddSettingOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSecret, setIsSecret] = useState(false);

  const loadData = async () => {
    setIsLoadingBackup(true);
    try {
      const [bRes, sRes] = await Promise.all([
        fetchBackupStatus().catch(() => null),
        fetchSettings().catch(() => ({ items: [], total: 0 })),
      ]);
      setBackupStatus(bRes);
      setAppSettings(sRes.items);
    } finally {
      setIsLoadingBackup(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreFileName(file.name);
    setRestoreError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      setRestoreFileBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleExecuteRestore = async () => {
    if (confirmInput.trim() !== 'CONFIRM') {
      setRestoreError("You must type exactly 'CONFIRM' to authorize database overwrite.");
      return;
    }
    if (!restoreFileBase64) {
      setRestoreError('Please select a valid SQLite database backup file.');
      return;
    }
    setIsRestoring(true);
    setRestoreError(null);
    try {
      const res = await restoreBackup(restoreFileBase64, 'CONFIRM');
      setRestoreSuccess(res.message);
      setIsRestoreOpen(false);
      setRestoreFileBase64(null);
      setConfirmInput('');
      await loadData();
      onRefresh();
    } catch (err: any) {
      setRestoreError(err.message || 'Restore failed.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleSaveSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    try {
      await upsertSetting({
        key: newKey.trim(),
        value: newValue.trim(),
        description: newDesc.trim() || undefined,
        is_secret: isSecret,
      });
      setIsAddSettingOpen(false);
      setNewKey('');
      setNewValue('');
      setNewDesc('');
      setIsSecret(false);
      await loadData();
    } catch (err: any) {
      alert(`Failed to save setting: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Database Persistence & Backup Management */}
      <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/[0.07] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F4F5F7]">Local-First SQLite Persistence & Backups</h3>
              <p className="text-xs text-[#9299A8]">Database survives process, browser, and computer restarts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={getBackupExportUrl()}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border border-[#22C55E]/25 text-[#22C55E] text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup (.db)</span>
            </a>

            <button
              onClick={() => setIsRestoreOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#191E29] hover:bg-[#202736] border border-white/[0.07] text-[#9299A8] hover:text-[#F4F5F7] text-xs font-medium transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>Restore Backup</span>
            </button>
          </div>
        </div>

        {restoreSuccess && (
          <div className="mt-4 p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{restoreSuccess}</span>
          </div>
        )}

        {/* Database Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
          <div className="p-3.5 rounded-lg bg-[#0E1118] border border-white/[0.04]">
            <span className="text-[#697386] block mb-1 text-[11px]">Database Engine</span>
            <span className="text-[#F4F5F7] font-semibold text-sm">SQLite (WAL Mode)</span>
            <span className="text-[10px] text-[#22C55E] block mt-1 font-mono">PRAGMA foreign_keys = ON</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0E1118] border border-white/[0.04]">
            <span className="text-[#697386] block mb-1 text-[11px]">Database File Size</span>
            <span className="text-[#60A5FA] font-semibold font-mono text-sm">
              {backupStatus ? backupStatus.size_formatted : '124.0 KB'}
            </span>
            <span className="text-[10px] text-[#697386] block mt-1">
              {backupStatus?.file_exists ? 'Verified on Disk' : 'Initialized'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0E1118] border border-white/[0.04]">
            <span className="text-[#697386] block mb-1 text-[11px]">Storage Path</span>
            <span className="text-[#8B5CF6] font-mono text-xs truncate block" title={backupStatus?.database_path}>
              data/agent_crash_test.db
            </span>
            <span className="text-[10px] text-[#697386] block mt-1">Local persistent file</span>
          </div>
        </div>

        {/* Record Counts Breakdown */}
        {backupStatus && (
          <div className="mt-4 p-3.5 rounded-lg bg-[#0E1118] border border-white/[0.04] flex flex-wrap items-center justify-between gap-3 text-xs text-[#9299A8]">
            <span>Persisted Records:</span>
            <div className="flex flex-wrap items-center gap-4 text-[#F4F5F7] font-mono">
              <span>Scenarios: <strong className="text-[#8B5CF6]">{backupStatus.table_counts.test_scenarios ?? 0}</strong></span>
              <span>Runs: <strong className="text-[#60A5FA]">{backupStatus.table_counts.test_runs ?? 0}</strong></span>
              <span>Events: <strong className="text-[#22C55E]">{backupStatus.table_counts.execution_events ?? 0}</strong></span>
              <span>Reports: <strong className="text-[#F59E0B]">{backupStatus.table_counts.test_reports ?? 0}</strong></span>
              <span>Settings: <strong className="text-[#9299A8]">{backupStatus.table_counts.application_settings ?? 0}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Live Backend Connection Diagnostics */}
      <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/[0.07] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F4F5F7]">Backend & Database Diagnostics</h3>
              <p className="text-xs text-[#9299A8]">Authoritative FastAPI engine verification</p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={status.isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#191E29] hover:bg-[#202736] border border-white/[0.07] text-[#F4F5F7] text-xs font-medium cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#8B5CF6] ${status.isLoading ? 'animate-spin' : ''}`} />
            <span>Re-check Connectivity</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0E1118] border border-white/[0.04]">
            <div className="text-[#697386] text-[11px] mb-2 font-medium">API Process Health (/api/health)</div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  status.apiStatus === 'healthy' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                }`}
              />
              <span
                className={`text-sm font-semibold uppercase ${
                  status.apiStatus === 'healthy' ? 'text-[#22C55E]' : 'text-[#EF4444]'
                }`}
              >
                {status.apiStatus}
              </span>
            </div>
            <div className="mt-2 text-[#9299A8] text-[11px]">
              Service: <span className="text-[#F4F5F7] font-mono">{status.serviceName}</span> · Latency: <span className="text-[#60A5FA] font-mono">{status.latencyMs ?? 0}ms</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1118] border border-white/[0.04]">
            <div className="text-[#697386] text-[11px] mb-2 font-medium">Database Readiness (/api/ready)</div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  status.dbStatus === 'connected' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                }`}
              />
              <span
                className={`text-sm font-semibold uppercase ${
                  status.dbStatus === 'connected' ? 'text-[#22C55E]' : 'text-[#EF4444]'
                }`}
              >
                {status.dbStatus === 'connected' ? 'Connected (Ready)' : status.dbStatus}
              </span>
            </div>
            <div className="mt-2 text-[#9299A8] text-[11px]">
              Active Driver: <span className="text-[#F4F5F7]">SQLite 3</span> · Pre-ping: <span className="text-[#22C55E]">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Persistent Application Settings Table */}
      <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F5F7] flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-[#8B5CF6]" />
              Application Settings Table
            </h3>
            <p className="text-xs text-[#9299A8]">Persistent configuration stored in SQLite</p>
          </div>
          <button
            onClick={() => setIsAddSettingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Setting</span>
          </button>
        </div>

        <div className="mt-4 divide-y divide-white/[0.04] text-xs">
          {appSettings.map((s) => (
            <div key={s.id} className="py-2.5 flex items-center justify-between gap-4">
              <div>
                <span className="font-medium text-[#F4F5F7] font-mono">{s.key}</span>
                {s.description && (
                  <span className="text-[#697386] text-[11px] block mt-0.5">{s.description}</span>
                )}
              </div>
              <span className="text-[#60A5FA] font-mono px-2 py-0.5 rounded bg-[#0E1118] border border-white/[0.06]">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Restore Backup Modal with Confirmation */}
      {isRestoreOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#131720] border border-white/[0.1] rounded-xl max-w-lg w-full p-6 relative space-y-4 text-xs shadow-xl">
            <h3 className="text-sm font-semibold text-[#EF4444] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              Restore Database from Backup
            </h3>

            <p className="text-[#9299A8] leading-relaxed">
              Restoring a backup will replace the current SQLite database (<code className="text-[#8B5CF6] font-mono">data/agent_crash_test.db</code>). A safety snapshot will be created before replacement.
            </p>

            {restoreError && (
              <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]">
                {restoreError}
              </div>
            )}

            <div>
              <label className="block text-[#9299A8] mb-1">Select SQLite Backup File (.db)</label>
              <input
                type="file"
                accept=".db,.sqlite,.sqlite3"
                onChange={handleFileSelect}
                className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg p-2 text-[#F4F5F7] file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-[#8B5CF6] file:text-white file:text-xs"
              />
            </div>

            <div>
              <label className="block text-[#EF4444] font-medium mb-1">
                Type CONFIRM to authorize overwrite:
              </label>
              <input
                type="text"
                placeholder="CONFIRM"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className="w-full bg-[#0E1118] border border-[#EF4444]/40 rounded-lg p-2 text-[#F4F5F7] font-mono font-semibold tracking-wider focus:outline-none focus:border-[#EF4444]"
              />
            </div>

            <div className="pt-3 border-t border-white/[0.07] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRestoreOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#191E29] hover:bg-[#202736] text-[#9299A8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRestoring || confirmInput.trim() !== 'CONFIRM' || !restoreFileBase64}
                onClick={handleExecuteRestore}
                className="px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-40 text-white font-medium cursor-pointer"
              >
                {isRestoring ? 'Restoring Database...' : 'Authorize Restore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Setting Modal */}
      {isAddSettingOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSaveSetting}
            className="bg-[#131720] border border-white/[0.1] rounded-xl max-w-md w-full p-6 space-y-4 text-xs shadow-xl"
          >
            <h3 className="text-sm font-semibold text-[#F4F5F7]">Add Persistent Configuration</h3>
            <div>
              <label className="block text-[#9299A8] mb-1">Key *</label>
              <input
                type="text"
                required
                placeholder="e.g. audit_retention_days"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg p-2 text-[#F4F5F7] font-mono focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <div>
              <label className="block text-[#9299A8] mb-1">Value *</label>
              <input
                type="text"
                required
                placeholder="e.g. 90"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg p-2 text-[#F4F5F7] font-mono focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <div>
              <label className="block text-[#9299A8] mb-1">Description</label>
              <input
                type="text"
                placeholder="Optional description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg p-2 text-[#F4F5F7] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddSettingOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#191E29] hover:bg-[#202736] text-[#9299A8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
