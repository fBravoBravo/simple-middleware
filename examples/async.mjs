import { createServer } from "http";
import { App } from "../dist/index.js";

const app = new App();

// Simulate a database fetch
function fetchUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, name: "Alice" }), 50);
  });
}

app.get("/users/:id", async (ctx) => {
  const user = await fetchUser(ctx.params.id);
  ctx.res.end(JSON.stringify(user));
});

// Multiple handlers on the same route using next()
app.get("/chain", (ctx, next) => {
  ctx.res.setHeader("X-Step-1", "done");
  next();
});

app.get("/chain", (ctx, next) => {
  ctx.res.setHeader("X-Step-2", "done");
  next();
});

app.get("/chain", (ctx) => {
  ctx.res.end("Chained handlers complete");
});

const server = createServer(app.handler);
server.listen(3005, () => {
  console.log("Async example: http://localhost:3005");
  console.log("  GET /users/42  -> {\"id\":42,\"name\":\"Alice\"}");
  console.log("  GET /chain     -> Chained handlers complete (with X-Step-1 and X-Step-2 headers)");
});
