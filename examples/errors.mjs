import { createServer } from "http";
import { App } from "../dist/index.js";

const app = new App();

app.get("/ok", (ctx) => {
  ctx.res.end("Everything is fine");
});

app.get("/throw", () => {
  throw new Error("Something went wrong!");
});

app.get("/async-error", async () => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  throw new Error("Async error!");
});

app.onError((err, ctx) => {
  ctx.res.statusCode = 400;
  ctx.res.end(`Custom error: ${err.message}`);
});

const server = createServer(app.handler);
server.listen(3004, () => {
  console.log("Errors example: http://localhost:3004");
  console.log("  GET /ok           -> Everything is fine");
  console.log("  GET /throw        -> Custom error: Something went wrong!");
  console.log("  GET /async-error  -> Custom error: Async error!");
});
