import { useState, useEffect, useCallback } from 'react';
import { BackendStatusState } from '../types';
import { checkFullBackendStatus } from '../services/api';

export function useBackendStatus(pollIntervalMs: number = 10000) {
  const [status, setStatus] = useState<BackendStatusState>({
    apiStatus: 'checking',
    dbStatus: 'checking',
    serviceName: 'agent-crash-test-api',
    appVersion: '1.0.0',
    apiVersion: 'v1',
    lastChecked: null,
    latencyMs: null,
    isLoading: true,
  });

  const refreshStatus = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isLoading: true }));
    const result = await checkFullBackendStatus();
    setStatus(result);
  }, []);

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, pollIntervalMs);
    return () => clearInterval(interval);
  }, [refreshStatus, pollIntervalMs]);

  return { status, refreshStatus };
}
