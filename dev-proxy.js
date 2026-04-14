/**
 * dev-proxy.js — Unified dev proxy for Daluxe
 * localhost:8081        → Expo storefront (port 8082)
 * localhost:8081/admin  → Next.js admin   (port 3001)
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PROXY_PORT = 8081;
const EXPO_PORT  = 8082;
const ADMIN_PORT = 3001;

const app = express();

// ── Admin: forward /admin/* to Next.js (keep full path — basePath requires it)
app.use(
  createProxyMiddleware({
    target: `http://localhost:${ADMIN_PORT}`,
    changeOrigin: true,
    ws: true,
    // pathFilter: only intercept /admin and anything under it
    pathFilter: (path) => path.startsWith('/admin'),
    on: {
      error(err, req, res) {
        if (res && !res.headersSent) {
          res.status(502).set('Content-Type', 'text/html').send(`
            <html><body style="font-family:sans-serif;background:#fdfbf7;padding:60px;max-width:500px;margin:auto">
              <h2 style="color:#C9A227">⏳ Admin panel is starting…</h2>
              <p style="color:#555">Next.js is booting up. Refresh in 5 seconds.</p>
              <script>setTimeout(()=>location.reload(),5000)</script>
            </body></html>`);
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
        if (res && !res.headersSent) res.status(502).send('Expo is starting up…');
      },
    },
  })
);

app.listen(PROXY_PORT, () => {
  console.log(`\n🚀  Daluxe Dev Proxy  →  http://localhost:${PROXY_PORT}`);
  console.log(`   Storefront : http://localhost:${PROXY_PORT}`);
  console.log(`   Admin panel: http://localhost:${PROXY_PORT}/admin\n`);
});
