import type { IncomingMessage, ServerResponse } from "http";

export type NextFunction = (err?: Error) => void;

export interface Context {
  req: IncomingMessage;
  res: ServerResponse;
  params: Record<string, string>;
}

export type Handler = (ctx: Context, next: NextFunction) => void | Promise<void>;
export type ErrorHandler = (err: Error, ctx: Context) => void;
