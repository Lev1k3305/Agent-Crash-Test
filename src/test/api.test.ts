import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchHealth, fetchReadiness, fetchVersion, checkFullBackendStatus } from '../services/api';

describe('API Client Service Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetchHealth returns status ok on 200 response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', service: 'agent-crash-test-api' }),
    });

    const result = await fetchHealth();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('agent-crash-test-api');
  });

  it('fetchReadiness returns degraded status on 503 response without throwing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        status: 'degraded',
        database: 'disconnected',
        error: 'Database connection failed',
      }),
    });

    const result = await fetchReadiness();
    expect(result.status).toBe('degraded');
    expect(result.database).toBe('disconnected');
    expect(result.error).toBe('Database connection failed');
  });

  it('fetchVersion returns version metadata', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        name: 'Agent Crash Test',
        app_version: '1.0.0',
        api_version: 'v1',
      }),
    });

    const result = await fetchVersion();
    expect(result.name).toBe('Agent Crash Test');
    expect(result.app_version).toBe('1.0.0');
  });

  it('checkFullBackendStatus handles complete network disconnection safely', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const status = await checkFullBackendStatus();
    expect(status.apiStatus).toBe('disconnected');
    expect(status.dbStatus).toBe('disconnected');
    expect(status.errorMessage).toContain('Network error');
  });

  it('fetchScenarios returns items list', async () => {
    const mockItems = [{ id: 1, code: 'SEC-01', name: 'Prompt Injection', category: 'Security' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: mockItems, total: 1 }),
    });

    const { fetchScenarios } = await import('../services/api');
    const res = await fetchScenarios();
    expect(res.total).toBe(1);
    expect(res.items[0].code).toBe('SEC-01');
  });
});
