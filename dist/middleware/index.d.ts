import { Request, Response } from "../context";
import { MiddlewareFunction } from "./types";
export declare class Middleware {
    middlewareFunction: MiddlewareFunction;
    dependencies: Middleware[];
    constructor(middlewareFunction: MiddlewareFunction);
    dependsOn(dependencies: Middleware[]): this;
    run(req: Request, res: Response): Promise<void>;
}
