import { Request, Response } from "../context";
export declare type MiddlewareFunction = ((req: Request, response: Response) => void) | ((req: Request, response: Response) => Promise<void>);
