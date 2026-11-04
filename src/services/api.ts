import { 
  HealthCheckResponse, 
  ReadyCheckResponse, 
  VersionResponse, 
  BackendStatusState,
  TestScenario,
  TestRun,
  TestReport,
  ApplicationSetting,
  BackupStatus,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// -----------------------------------------------------------------------------
// Health & System Diagnostics
// -----------------------------------------------------------------------------

export async function fetchHealth(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Health endpoint returned status ${response.status}`);
  }
  return response.json();
}

export async function fetchReadiness(): Promise<ReadyCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ready`, {
    headers: { Accept: 'application/json' },
  });
  const data = await response.json();
  return data;
}

export async function fetchVersion(): Promise<VersionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/version`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Version endpoint returned status ${response.status}`);
  }
  return response.json();
}

export async function checkFullBackendStatus(): Promise<BackendStatusState> {
  const startTime = performance.now();
  try {
    const [healthData, readyData, versionData] = await Promise.all([
      fetchHealth(),
      fetchReadiness().catch((err) => ({
        status: 'degraded' as const,
        database: 'disconnected' as const,
        error: err.message || 'Database connection unreachable',
      })),
      fetchVersion().catch(() => ({
        name: 'Agent Crash Test',
        app_version: '1.0.0',
        api_version: 'v1',
      })),
    ]);

    const latency = Math.round(performance.now() - startTime);

    return {
      apiStatus: healthData.status === 'ok' ? 'healthy' : 'degraded',
      dbStatus: readyData.database === 'connected' ? 'connected' : 'disconnected',
      serviceName: healthData.service || 'agent-crash-test-api',
      appVersion: versionData.app_version || '1.0.0',
      apiVersion: versionData.api_version || 'v1',
      lastChecked: new Date(),
      latencyMs: latency,
      errorMessage: readyData.error,
      isLoading: false,
    };
  } catch (err: any) {
    const latency = Math.round(performance.now() - startTime);
    return {
      apiStatus: 'disconnected',
      dbStatus: 'disconnected',
      serviceName: 'agent-crash-test-api',
      appVersion: '1.0.0',
      apiVersion: 'v1',
      lastChecked: new Date(),
      latencyMs: latency,
      errorMessage: err.message || 'Backend service unreachable',
      isLoading: false,
    };
  }
}

// -----------------------------------------------------------------------------
// Test Scenarios CRUD
// -----------------------------------------------------------------------------

export async function fetchScenarios(category?: string, search?: string): Promise<{ items: TestScenario[]; total: number }> {
  const params = new URLSearchParams();
  if (category && category.toLowerCase() !== 'all') {
    params.append('category', category);
  }
  if (search) {
    params.append('search', search);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/api/scenarios${query}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch scenarios' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function createScenario(payload: Partial<TestScenario>): Promise<TestScenario> {
  const response = await fetch(`${API_BASE_URL}/api/scenarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to create scenario' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function updateScenario(id: number, payload: Partial<TestScenario>): Promise<TestScenario> {
  const response = await fetch(`${API_BASE_URL}/api/scenarios/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to update scenario' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function deleteScenario(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/scenarios/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to delete scenario' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
}

// -----------------------------------------------------------------------------
// Test Runs CRUD
// -----------------------------------------------------------------------------

export async function fetchRuns(scenarioId?: number): Promise<{ items: TestRun[]; total: number }> {
  const params = new URLSearchParams();
  if (scenarioId) {
    params.append('scenario_id', scenarioId.toString());
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/api/runs${query}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch test runs' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function createRun(payload: {
  scenario_id: number;
  run_number?: string;
  status?: string;
  result?: string;
  risk_score?: number;
  duration_seconds?: number;
  target_system?: string;
  notes?: string;
  create_default_events?: boolean;
  create_report?: boolean;
}): Promise<TestRun> {
  const response = await fetch(`${API_BASE_URL}/api/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to create test run' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function fetchRunDetails(id: number): Promise<TestRun & { events: any[]; report?: TestReport }> {
  const response = await fetch(`${API_BASE_URL}/api/runs/${id}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch run details' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function deleteRun(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/runs/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to delete test run' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
}

// -----------------------------------------------------------------------------
// Test Reports & Export
// -----------------------------------------------------------------------------

export async function fetchReports(): Promise<{ items: TestReport[]; total: number }> {
  const response = await fetch(`${API_BASE_URL}/api/reports`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch reports' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function deleteReport(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to delete report' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
}

export function getReportExportUrl(reportId: number, format: 'json' | 'csv'): string {
  return `${API_BASE_URL}/api/reports/${reportId}/export?format=${format}`;
}

// -----------------------------------------------------------------------------
// Application Settings
// -----------------------------------------------------------------------------

export async function fetchSettings(): Promise<{ items: ApplicationSetting[]; total: number }> {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch settings' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function upsertSetting(payload: Partial<ApplicationSetting>): Promise<ApplicationSetting> {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to save setting' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

// -----------------------------------------------------------------------------
// Database Backup & Restore
// -----------------------------------------------------------------------------

export async function fetchBackupStatus(): Promise<BackupStatus> {
  const response = await fetch(`${API_BASE_URL}/api/backup/status`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch backup status' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export function getBackupExportUrl(): string {
  return `${API_BASE_URL}/api/backup/export`;
}

export async function restoreBackup(base64Content: string, confirmation: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/backup/restore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      confirmation,
      backup_content_base64: base64Content,
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to restore backup' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
  return response.json();
}
