import { Request, Response } from "../context";
import { MiddlewareFunction } from "./types";

export class Middleware {
  middlewareFunction: MiddlewareFunction;
  dependencies: Middleware[];

  constructor(middlewareFunction: MiddlewareFunction) {
    this.middlewareFunction = middlewareFunction;
    this.dependencies = [];
  }

  dependsOn(dependencies: Middleware[]) {
    this.dependencies = dependencies;
  }

  async run(req: Request, res: Response) {
    try {
      return await this.middlewareFunction(req, res);
    } catch (err) {
      throw err;
    }
  }
}
