import { createServer } from "http";
import { App } from "../dist/index.js";

const app = new App();

app.get("/users/:id", (ctx) => {
  ctx.res.end(`User ID: ${ctx.params.id}`);
});

app.get("/users/:id/posts/:postId", (ctx) => {
  ctx.res.end(`User ${ctx.params.id}, Post ${ctx.params.postId}`);
});

const server = createServer(app.handler);
server.listen(3003, () => {
  console.log("Params example: http://localhost:3003");
  console.log("  GET /users/42          -> User ID: 42");
  console.log("  GET /users/42/posts/7  -> User 42, Post 7");
});
