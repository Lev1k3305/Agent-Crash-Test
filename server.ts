import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import http from 'http';
import { spawn, ChildProcess } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const FASTAPI_PORT = process.env.FASTAPI_PORT ? parseInt(process.env.FASTAPI_PORT, 10) : 8000;

let fastApiProcess: ChildProcess | null = null;

// Start FastAPI background process if not already running
function ensureFastApiRunning() {
  const checkReq = http.get(`http://127.0.0.1:${FASTAPI_PORT}/api/health`, (res) => {
    if (res.statusCode === 200) {
      console.log(`[Server] FastAPI authoritative backend is already running on port ${FASTAPI_PORT}`);
    }
  });

  checkReq.on('error', () => {
    console.log(`[Server] Spawning authoritative FastAPI backend process on 127.0.0.1:${FASTAPI_PORT}...`);
    fastApiProcess = spawn(
      'python3',
      ['-m', 'uvicorn', 'backend.app.main:app', '--host', '127.0.0.1', '--port', `${FASTAPI_PORT}`],
      {
        stdio: 'inherit',
        env: { ...process.env, PYTHONUNBUFFERED: '1' },
      }
    );

    fastApiProcess.on('error', (err) => {
      console.error('[Server] Failed to spawn FastAPI process:', err.message);
    });

    fastApiProcess.on('exit', (code, signal) => {
      console.log(`[Server] FastAPI process exited with code ${code} / signal ${signal}`);
    });
  });
}

// Transparent reverse proxy to authoritative FastAPI backend
app.use('/api', (req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: FASTAPI_PORT,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${FASTAPI_PORT}`,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.status(503).json({
      status: 'degraded',
      error: `FastAPI backend unavailable on port ${FASTAPI_PORT}: ${err.message}`,
    });
  });

  req.pipe(proxyReq, { end: true });
});

// Frontend Vite Integration (Vite middleware in dev, static files in production)
async function startServer() {
  ensureFastApiRunning();

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Agent Crash Test] Frontend + Dev Proxy running at http://0.0.0.0:${PORT}`);
    console.log(`[Agent Crash Test] Authoritative backend proxies /api to http://127.0.0.1:${FASTAPI_PORT}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    if (fastApiProcess) {
      fastApiProcess.kill();
    }
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
