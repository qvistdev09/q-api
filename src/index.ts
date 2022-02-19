import { Api } from "./features/api";
import { Middleware } from "./features/middleware";
import { MiddlewareFunction } from "./features/middleware/types";

const Q = {
  createApi: (basePath: string, errorHandler: MiddleWare) => new Api(basePath, errorHandler),
  createMiddleware: (middlewareFunction: MiddlewareFunction) => new Middleware(middlewareFunction),
};

export default Q;
