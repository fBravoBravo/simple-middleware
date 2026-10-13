import { createServer } from "http";
import { App } from "../dist/index.js";

const app = new App();

app.get("/", (ctx) => {
  ctx.res.end("Hello from simple-middleware!");
});

app.get("/about", (ctx) => {
  ctx.res.end("About page");
});

app.post("/create", (ctx) => {
  ctx.res.statusCode = 201;
  ctx.res.end("Resource created");
});

const server = createServer(app.handler);
server.listen(3001, () => {
  console.log("Basic example: http://localhost:3001");
  console.log("  GET  /       -> Hello from simple-middleware!");
  console.log("  GET  /about  -> About page");
  console.log("  POST /create -> Resource created");
});
