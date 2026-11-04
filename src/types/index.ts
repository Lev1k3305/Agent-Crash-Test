export type SystemStatusType = 'healthy' | 'checking' | 'disconnected' | 'degraded';
export type DatabaseStatusType = 'connected' | 'checking' | 'disconnected';

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  service: string;
}

export interface ReadyCheckResponse {
  status: 'ready' | 'degraded';
  database: 'connected' | 'disconnected';
  error?: string;
}

export interface VersionResponse {
  name: string;
  app_version: string;
  api_version: string;
}

export interface BackendStatusState {
  apiStatus: SystemStatusType;
  dbStatus: DatabaseStatusType;
  serviceName: string;
  appVersion: string;
  apiVersion: string;
  lastChecked: Date | null;
  latencyMs: number | null;
  errorMessage?: string;
  isLoading: boolean;
}

export type NavPage = 'overview' | 'scenarios' | 'runs' | 'reports' | 'attack-library' | 'settings';

export interface TestScenario {
  id: number;
  code: string;
  name: string;
  category: 'Security' | 'Business' | 'Reliability' | string;
  risk_level: 'Critical' | 'High' | 'Medium' | 'Low' | string;
  description: string;
  detailed_threat?: string;
  target_workflow?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  runs_count?: number;
}

export interface TestRun {
  id: number;
  run_number: string;
  scenario_id: number;
  scenario_name?: string;
  scenario_code?: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | string;
  result: 'PASSED' | 'FAILED' | 'INCONCLUSIVE' | string;
  risk_score: number;
  duration_seconds: number;
  target_system: string;
  notes?: string;
  events_count?: number;
  has_report?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExecutionEvent {
  id: number;
  run_id: number;
  sequence_number: number;
  timestamp: string;
  event_type: 'NAVIGATION' | 'ACTION' | 'VERIFICATION' | 'SECURITY_ALERT' | 'ERROR' | string;
  message: string;
  details?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE' | 'PENDING' | string;
}

export interface TestReport {
  id: number;
  run_id: number;
  run_number?: string;
  scenario_name?: string;
  summary: string;
  result: 'PASSED' | 'FAILED' | 'CRITICAL_FAILURE' | string;
  risk_score: number;
  findings_count: number;
  findings_summary?: string;
  evidence_summary?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  is_secret: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BackupStatus {
  database_type: string;
  database_path: string;
  file_exists: boolean;
  size_bytes: number;
  size_formatted: string;
  last_modified?: string;
  table_counts: Record<string, number>;
}
