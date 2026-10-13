import { createServer } from "http";
import { App } from "../dist/index.js";

const app = new App();

// Global middleware: runs on every request
app.use((ctx, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${ctx.req.method} ${ctx.req.url}`);
  next();
  const duration = Date.now() - start;
  console.log(`  -> completed in ${duration}ms`);
});

// Path-based middleware: only runs under /api
app.use("/api", (ctx, next) => {
  ctx.res.setHeader("X-API-Version", "1.0");
  next();
});

app.get("/", (ctx) => {
  ctx.res.end("Home page (no API header)");
});

app.get("/api/status", (ctx) => {
  ctx.res.end(JSON.stringify({ status: "ok" }));
});

app.get("/api/users", (ctx) => {
  ctx.res.end(JSON.stringify([{ id: 1, name: "Alice" }]));
});

const server = createServer(app.handler);
server.listen(3002, () => {
  console.log("Middleware example: http://localhost:3002");
  console.log("  GET /            -> Home page (no X-API-Version header)");
  console.log("  GET /api/status  -> JSON with X-API-Version: 1.0");
  console.log("  GET /api/users   -> JSON with X-API-Version: 1.0");
});
