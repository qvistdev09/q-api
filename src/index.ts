import { Api } from "./base";
import { Middleware } from "./features/middleware";
import { MiddlewareFunction } from "./features/middleware/types";

const Q = {
  createApi: (basePath: string) => new Api(basePath),
  createMiddleware: (middlewareFunction: MiddlewareFunction) => new Middleware(middlewareFunction),
};

export default Q;
