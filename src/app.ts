import type { IncomingMessage, ServerResponse } from "http";
import type { Context, Handler, ErrorHandler, NextFunction } from "./types.js";
import { matchRoute, matchMiddleware } from "./router.js";

interface StackItem {
  method: string;
  pattern: string;
  handler: Handler;
  isMiddleware: boolean;
}

export class App {
  private stack: StackItem[] = [];
  private errorHandler: ErrorHandler | null = null;

  use(handler: Handler): void;
  use(pattern: string, handler: Handler): void;
  use(patternOrHandler: string | Handler, handler?: Handler): void {
    let pattern: string;
    let h: Handler;

    if (typeof patternOrHandler === "function") {
      pattern = "*";
      h = patternOrHandler;
    } else {
      pattern = patternOrHandler;
      if (!handler) {
        throw new Error("Handler is required when pattern is provided");
      }
      h = handler;
    }

    this.stack.push({
      method: "ALL",
      pattern,
      handler: h,
      isMiddleware: true,
    });
  }

  get(pattern: string, handler: Handler) {
    this.stack.push({ method: "GET", pattern, handler, isMiddleware: false });
  }

  post(pattern: string, handler: Handler) {
    this.stack.push({ method: "POST", pattern, handler, isMiddleware: false });
  }

  put(pattern: string, handler: Handler) {
    this.stack.push({ method: "PUT", pattern, handler, isMiddleware: false });
  }

  delete(pattern: string, handler: Handler) {
    this.stack.push({ method: "DELETE", pattern, handler, isMiddleware: false });
  }

  patch(pattern: string, handler: Handler) {
    this.stack.push({ method: "PATCH", pattern, handler, isMiddleware: false });
  }

  all(pattern: string, handler: Handler) {
    this.stack.push({ method: "ALL", pattern, handler, isMiddleware: false });
  }

  onError(handler: ErrorHandler) {
    this.errorHandler = handler;
  }

  handler = (req: IncomingMessage, res: ServerResponse): void => {
    const url = new URL(req.url || "/", `http://localhost`).pathname;
    const method = req.method || "GET";

    const matching: Array<{ handler: Handler; params: Record<string, string> }> = [];

    for (const item of this.stack) {
      if (item.isMiddleware) {
        if (item.method !== "ALL" && item.method !== method) continue;
        if (!matchMiddleware(item.pattern, url)) continue;
        matching.push({ handler: item.handler, params: {} });
      } else {
        if (item.method !== "ALL" && item.method !== method) continue;
        const match = matchRoute(item.pattern, url);
        if (match.matched) {
          matching.push({ handler: item.handler, params: match.params });
        }
      }
    }

    let index = 0;

    const ctx: Context = {
      req,
      res,
      params: {},
    };

    const next: NextFunction = (err?: Error): void => {
      if (res.writableEnded) return;

      if (err) {
        if (this.errorHandler) {
          try {
            this.errorHandler(err, ctx);
          } catch {
            this.sendDefaultError(res);
          }
        } else {
          this.sendDefaultError(res);
        }
        return;
      }

      const current = matching[index++];
      if (!current) {
        if (!res.writableEnded) {
          res.statusCode = 404;
          res.end("Not Found");
        }
        return;
      }

      ctx.params = current.params;

      try {
        const result = current.handler(ctx, next);
        if (result instanceof Promise) {
          result.catch((e) => next(e instanceof Error ? e : new Error(String(e))));
        }
      } catch (e) {
        next(e instanceof Error ? e : new Error(String(e)));
      }
    };

    next();
  };

  private sendDefaultError(res: ServerResponse) {
    if (!res.writableEnded) {
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }
}
