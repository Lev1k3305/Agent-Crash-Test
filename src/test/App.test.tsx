import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import * as api from '../services/api';

describe('Agent Crash Test — Frontend Suite (Local-First Persistence)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, 'checkFullBackendStatus').mockResolvedValue({
      apiStatus: 'healthy',
      dbStatus: 'connected',
      serviceName: 'agent-crash-test-api',
      appVersion: '1.0.0',
      apiVersion: 'v1',
      lastChecked: new Date(),
      latencyMs: 12,
      isLoading: false,
    });
    vi.spyOn(api, 'fetchScenarios').mockResolvedValue({
      items: [
        {
          id: 1,
          code: 'SEC-01',
          name: 'Prompt Injection',
          category: 'Security',
          risk_level: 'Critical',
          description: 'Directive override verification',
          is_active: true,
          runs_count: 0,
        },
      ],
      total: 1,
    });
    vi.spyOn(api, 'fetchRuns').mockResolvedValue({
      items: [
        {
          id: 1,
          run_number: 'RUN-0001',
          scenario_id: 1,
          scenario_name: 'Prompt Injection',
          scenario_code: 'SEC-01',
          status: 'COMPLETED',
          result: 'PASSED',
          risk_score: 15,
          duration_seconds: 4.2,
          target_system: 'E-commerce CRM',
          created_at: new Date().toISOString(),
        },
      ],
      total: 1,
    });
    vi.spyOn(api, 'fetchReports').mockResolvedValue({
      items: [
        {
          id: 1,
          run_id: 1,
          run_number: 'RUN-0001',
          scenario_name: 'Prompt Injection',
          summary: 'Audit completed successfully',
          result: 'PASSED',
          risk_score: 15,
          findings_count: 0,
          created_at: new Date().toISOString(),
        },
      ],
      total: 1,
    });
    vi.spyOn(api, 'fetchBackupStatus').mockResolvedValue({
      database_type: 'SQLite (Local-First)',
      database_path: 'data/agent_crash_test.db',
      file_exists: true,
      size_bytes: 126976,
      size_formatted: '124.0 KB',
      table_counts: {
        test_scenarios: 6,
        test_runs: 1,
        execution_events: 5,
        test_reports: 1,
        application_settings: 4,
      },
    });
    vi.spyOn(api, 'fetchSettings').mockResolvedValue({
      items: [
        {
          id: 1,
          key: 'database_storage_type',
          value: 'SQLite (Local-First)',
          is_secret: false,
        },
      ],
      total: 1,
    });
  });

  it('renders application shell and branding', async () => {
    render(<App />);
    expect(screen.getByText('Agent Crash Test')).toBeInTheDocument();
    expect(screen.getByText('AI Agent Reliability & Security')).toBeInTheDocument();
    expect(screen.getByText('[ CYBER OPERATIONS CENTER ]')).toBeInTheDocument();
  });

  it('displays persistent metrics loaded from SQLite database', async () => {
    render(<App />);
    expect(screen.getByText('Total Test Runs')).toBeInTheDocument();
    expect(screen.getByText('Tests Passed')).toBeInTheDocument();
    expect(screen.getByText('Tests Failed')).toBeInTheDocument();
    expect(screen.getByText('Active Scenarios')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/LOCAL-FIRST SQLITE PERSISTENCE ACTIVE/i)).toBeInTheDocument();
    });
  });

  it('navigates between sidebar views and displays persistent data', async () => {
    render(<App />);
    
    // Navigate to Test Scenarios
    const scenariosButton = screen.getByRole('button', { name: /Test Scenarios/i });
    fireEvent.click(scenariosButton);
    await waitFor(() => {
      expect(screen.getByText('Prompt Injection')).toBeInTheDocument();
      expect(screen.getByText('SEC-01')).toBeInTheDocument();
    });

    // Navigate to Test Runs
    const runsButton = screen.getByRole('button', { name: /Test Runs/i });
    fireEvent.click(runsButton);
    await waitFor(() => {
      expect(screen.getByText('RUN-0001')).toBeInTheDocument();
      expect(screen.getByText(/Record Test Run/i)).toBeInTheDocument();
    });

    // Navigate to Reports
    const reportsButton = screen.getByRole('button', { name: /Reports/i });
    fireEvent.click(reportsButton);
    await waitFor(() => {
      expect(screen.getByText('Forensic Audit Reports')).toBeInTheDocument();
      expect(screen.getByText(/Audit completed successfully/i)).toBeInTheDocument();
    });

    // Navigate to Settings
    const settingsButton = screen.getByRole('button', { name: /Settings/i });
    fireEvent.click(settingsButton);
    await waitFor(() => {
      expect(screen.getByText(/Local-First SQLite Persistence & Backups/i)).toBeInTheDocument();
      expect(screen.getByText('Export Backup (.db)')).toBeInTheDocument();
    });
  });

  it('renders backend health and database status indicators correctly', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('System Status')).toBeInTheDocument();
      expect(screen.getByText(/connected/i)).toBeInTheDocument();
      expect(screen.getByText(/healthy/i)).toBeInTheDocument();
    });
  });

  it('handles backend error state and degraded database gracefully', async () => {
    vi.spyOn(api, 'checkFullBackendStatus').mockResolvedValue({
      apiStatus: 'disconnected',
      dbStatus: 'disconnected',
      serviceName: 'agent-crash-test-api',
      appVersion: '1.0.0',
      apiVersion: 'v1',
      lastChecked: new Date(),
      latencyMs: 45,
      errorMessage: 'Database connection failed',
      isLoading: false,
    });

    render(<App />);
    
    const settingsButton = screen.getByRole('button', { name: /Settings/i });
    fireEvent.click(settingsButton);

    await waitFor(() => {
      expect(screen.getAllByText(/disconnected/i).length).toBeGreaterThan(0);
    });
  });
});
