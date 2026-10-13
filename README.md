# simple-middleware

A lightweight middleware framework for Node.js built on top of the native `http` module. Inspired by [Hono](https://github.com/honojs/hono).

## Installation

```bash
npm install simple-middleware
```

## Usage

```ts
import { createServer } from "http";
import { App } from "simple-middleware";

const app = new App();

// Middleware
app.use((ctx, next) => {
  console.log(`${ctx.req.method} ${ctx.req.url}`);
  next();
});

// Routes
app.get("/", (ctx) => {
  ctx.res.end("Hello World");
});

app.get("/users/:id", (ctx) => {
  ctx.res.end(`User: ${ctx.params.id}`);
});

app.post("/users", (ctx) => {
  ctx.res.statusCode = 201;
  ctx.res.end("Created");
});

// Error handling
app.onError((err, ctx) => {
  ctx.res.statusCode = 500;
  ctx.res.end(err.message);
});

// Plug into native Node http server
const server = createServer(app.handler);
server.listen(3000);
```

## API

### `app.use(handler)` / `app.use(pattern, handler)`
Register middleware. Without a pattern, it runs on every request. With a pattern, it only runs for matching paths.

### `app.get(pattern, handler)` / `app.post(...)` / `app.put(...)` / `app.delete(...)` / `app.patch(...)` / `app.all(...)`
Register route handlers.

### `app.onError(handler)`
Register a global error handler.

### `app.handler`
A function compatible with `http.createServer(app.handler)`.

## Context

Every handler receives a `Context` object:

- `ctx.req` — Node.js `IncomingMessage`
- `ctx.res` — Node.js `ServerResponse`
- `ctx.params` — URL parameters extracted from the route pattern

## Examples

Check the `examples/` folder for runnable demos:

```bash
npm run build
node examples/basic.mjs       # Routes & HTTP methods
node examples/middleware.mjs  # Global & path-based middleware
node examples/params.mjs      # Route parameters
node examples/errors.mjs      # Error handling
node examples/async.mjs       # Async handlers & chained routes
```

## Development

```bash
npm install
npm test
npm run build
npm run typecheck
```
