import express from "express";
import cors from "cors";
import { swaggerSpec } from "./swagger";

// Routers
import SuperadminCompanyRouter from "./routes/superadmin/company.router";
import SuperadminUserRouter from "./routes/superadmin/user.router";
import SuperadminAuthRouter from "./routes/superadmin/auth.router";
import OperatorProductRouter from "./routes/operator/product.router";
import OperatorUserRouter from "./routes/operator/user.router";

const app = express();

app.use(cors());
app.use(express.json());

// OpenAPI JSON for programmatic access
app.get("/openapi.json", (req, res) => {
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const host = req.headers.host || "localhost:4000";
  const spec = { ...swaggerSpec, servers: [{ url: `${proto}://${host}` }] };
  res.json(spec);
});

// Swagger UI via CDN (works reliably on serverless platforms)
app.get("/api-docs", (_req, res) => {
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>INCIT API Docs</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" onerror="this.remove()" />
      <style>html,body,#swagger-ui{height:100%} body{margin:0;background:#fff} #log{font:12px monospace;color:#b00;padding:8px}</style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <pre id="log" style="display:none"></pre>
      <script>
        const addScript = (src) => new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = src; s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
        });
        const log = (msg) => { const el=document.getElementById('log'); el.style.display='block'; el.textContent += String(msg)+'\n'; };
        window.addEventListener('load', async () => {
          try {
            try {
              await addScript('https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js');
              await addScript('https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js');
            } catch (e) {
              log('CDN jsdelivr failed, falling back to unpkg');
              await addScript('https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js');
              await addScript('https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js');
            }
            const ui = window.SwaggerUIBundle({
              url: '/openapi.json',
              dom_id: '#swagger-ui',
              presets: [window.SwaggerUIBundle.presets.apis, window.SwaggerUIStandalonePreset],
              layout: 'StandaloneLayout',
              docExpansion: 'list',
              deepLinking: true,
            });
            window.ui = ui;
          } catch (err) {
            log(err?.message || err);
          }
        });
      </script>
    </body>
  </html>`;
  res.status(200).setHeader("Content-Type", "text/html; charset=utf-8").send(html);
});

// Mount routers
app.use(SuperadminCompanyRouter);
app.use(SuperadminUserRouter);
app.use(SuperadminAuthRouter);
app.use(OperatorProductRouter);
app.use(OperatorUserRouter);

export default app;
