import { describe, it, expect, vi } from "vitest";
import { App } from "../app";
import type { IncomingMessage, ServerResponse } from "http";

function createMockReq(options: { method?: string; url?: string } = {}) {
  return {
    method: options.method || "GET",
    url: options.url || "/",
  } as unknown as IncomingMessage;
}

function createMockRes() {
  const res: any = {
    statusCode: 200,
    writableEnded: false,
  };
  res.end = vi.fn((data?: string) => {
    res.writableEnded = true;
    res._body = data;
  });
  res.write = vi.fn();
  res.setHeader = vi.fn();
  return res as unknown as ServerResponse & { _body?: string; writableEnded: boolean };
}

describe("App", () => {
  it("handles a simple GET route", () => {
    const app = new App();
    app.get("/hello", (ctx) => {
      ctx.res.end("Hello!");
    });

    const req = createMockReq({ url: "/hello" });
    const res = createMockRes();
    app.handler(req, res);

    expect(res.end).toHaveBeenCalledWith("Hello!");
    expect(res.statusCode).toBe(200);
  });

  it("handles route params", () => {
    const app = new App();
    app.get("/users/:id", (ctx) => {
      ctx.res.end(`User: ${ctx.params.id}`);
    });

    const req = createMockReq({ url: "/users/123" });
    const res = createMockRes();
    app.handler(req, res);

    expect(res.end).toHaveBeenCalledWith("User: 123");
  });

  it("handles multiple route params", () => {
    const app = new App();
    app.get("/users/:id/posts/:postId", (ctx) => {
      ctx.res.end(`User: ${ctx.params.id}, Post: ${ctx.params.postId}`);
    });

    const req = createMockReq({ url: "/users/42/posts/7" });
    const res = createMockRes();
    app.handler(req, res);

    expect(res.end).toHaveBeenCalledWith("User: 42, Post: 7");
  });

  it("runs middleware before route handlers", () => {
    const app = new App();
    const order: string[] = [];

    app.use((ctx, next) => {
      order.push("middleware");
      next();
    });

    app.get("/test", (ctx) => {
      order.push("route");
      ctx.res.end("done");
    });

    const req = createMockReq({ url: "/test" });
    const res = createMockRes();
    app.handler(req, res);

    expect(order).toEqual(["middleware", "route"]);
    expect(res.end).toHaveBeenCalledWith("done");
  });

  it("runs path-based middleware only for matching paths", () => {
    const app = new App();
    let called = false;

    app.use("/api", (ctx, next) => {
      called = true;
      next();
    });

    app.get("/other", (ctx) => {
      ctx.res.end("other");
    });

    const req = createMockReq({ url: "/other" });
    const res = createMockRes();
    app.handler(req, res);

    expect(called).toBe(false);
  });

  it("handles POST requests", () => {
    const app = new App();
    app.post("/create", (ctx) => {
      ctx.res.end("Created");
    });

    const req = createMockReq({ method: "POST", url: "/create" });
    const res = createMockRes();
    app.handler(req, res);

    expect(res.end).toHaveBeenCalledWith("Created");
  });

  it("returns 404 when no route matches", () => {
    const app = new App();
    app.get("/exists", (ctx) => {
      ctx.res.end("OK");
    });

    const req = createMockReq({ url: "/missing" });
    const res = createMockRes();
    app.handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.end).toHaveBeenCalledWith("Not Found");
  });

  it("handles errors thrown in handlers", () => {
    const app = new App();
    app.get("/error", () => {
      throw new Error("Oops");
    });

    const req = createMockReq({ url: "/error" });
    const res = createMockRes();
    app.handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.end).toHaveBeenCalledWith("Internal Server Error");
  });

  it("calls custom error handler", () => {
    const app = new App();
    app.get("/error", () => {
      throw new Error("Oops");
    });

    app.onError((err, ctx) => {
      ctx.res.statusCode = 418;
      ctx.res.end(`Error: ${err.message}`);
    });

    const req = createMockReq({ url: "/error" });
    const res = createMockRes();
    app.handler(req, res);

    expect(res.statusCode).toBe(418);
    expect(res.end).toHaveBeenCalledWith("Error: Oops");
  });

  it("supports async handlers", async () => {
    const app = new App();
    app.get("/async", async (ctx, next) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      ctx.res.end("Async done");
    });

    const req = createMockReq({ url: "/async" });
    const res = createMockRes();
    app.handler(req, res);

    // Wait for async handler
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(res.end).toHaveBeenCalledWith("Async done");
  });

  it("supports multiple route handlers via next()", () => {
    const app = new App();
    const order: string[] = [];

    app.get("/multi", (ctx, next) => {
      order.push("first");
      next();
    });

    app.get("/multi", (ctx) => {
      order.push("second");
      ctx.res.end("done");
    });

    const req = createMockReq({ url: "/multi" });
    const res = createMockRes();
    app.handler(req, res);

    expect(order).toEqual(["first", "second"]);
  });
});
