/**
 * dev-proxy.js — Unified dev proxy for Daluxe
 * localhost:8081           → Expo storefront  (port 8082)
 * localhost:8081/admin     → Next.js admin    (port 3001)
 * localhost:8081/api       → Next.js admin    (port 3001)  ← API routes
 * localhost:8081/_next     → Next.js admin    (port 3001)  ← CSS/JS bundles
 * localhost:8081/__nextjs  → Next.js admin    (port 3001)  ← HMR websocket
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PROXY_PORT = 8081;
const EXPO_PORT  = 8082;
const ADMIN_PORT = 3001;

const app = express();

// ── Next.js paths: /admin, /api, /_next (CSS/JS), /__nextjs (HMR)
app.use(
  createProxyMiddleware({
    target: `http://localhost:${ADMIN_PORT}`,
    changeOrigin: true,
    ws: true,
    pathFilter: (path) =>
      path.startsWith('/admin') ||
      path.startsWith('/api') ||
      path.startsWith('/_next') ||
      path.startsWith('/__nextjs'),
    on: {
      proxyReq: (proxyReq, req, res) => {
        // Optional: Log proxying to help debug
        // console.log(`[PROXY] Admin: ${req.method} ${req.url}`);
      },
      error(err, req, res) {
        if (res && !res.headersSent && typeof res.status === 'function') {
          if (req.path?.startsWith('/api')) {
            res.status(502).json({ success: false, error: 'API server is starting up. Retry in a moment.' });
          } else if (req.path?.startsWith('/_next') || req.path?.startsWith('/__nextjs')) {
            // Silently ignore asset errors (Next.js still booting)
            res.status(502).end();
          } else {
            res.status(502).set('Content-Type', 'text/html').send(`
              <html><body style="font-family:sans-serif;background:#fdfbf7;padding:60px;max-width:500px;margin:auto">
                <h2 style="color:#C9A227">⏳ Admin panel is starting…</h2>
                <p style="color:#555">Next.js is booting up. Refresh in 5 seconds.</p>
                <script>setTimeout(()=>location.reload(),5000)</script>
              </body></html>`);
          }
        } else if (res && typeof res.end === 'function') {
          res.end(); // Handle socket errors
        }
      },
    },
  })
);

// ── Everything else → Expo Metro
app.use(
  createProxyMiddleware({
    target: `http://localhost:${EXPO_PORT}`,
    changeOrigin: true,
    ws: true,
    on: {
      error(err, req, res) {
        if (res && !res.headersSent && typeof res.status === 'function') {
          res.status(502).send('Expo is starting up…');
        } else if (res && typeof res.end === 'function') {
          res.end();
        }
      },
    },
  })
);

app.listen(PROXY_PORT, () => {
  console.log(`\n🚀  Daluxe Dev Proxy  →  http://localhost:${PROXY_PORT}`);
  console.log(`   Storefront : http://localhost:${PROXY_PORT}`);
  console.log(`   Admin panel: http://localhost:${PROXY_PORT}/admin`);
  console.log(`   API routes : http://localhost:${PROXY_PORT}/api/*  →  Next.js\n`);
});
