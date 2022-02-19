import { Request, Response } from "../context";

export type ErrorHandler = (req: Request, res: Response, err: any) => void;
