import { Request, Response } from "../context";

export type MiddlewareFunction =
  | ((req: Request, response: Response) => void)
  | ((req: Request, response: Response) => Promise<void>);
