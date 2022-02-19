import { Api } from "./base";
import { Middleware } from "./features/middleware";
import { MiddlewareFunction } from "./features/middleware/types";
import { Route } from "./features/routing";

const Q = {
  createApi: (basePath: string) => new Api(basePath),
  createRoute: (middlewares: Middleware[]) => new Route(middlewares),
  createMiddleware: (middlewareFunction: MiddlewareFunction) => new Middleware(middlewareFunction),
};

export default Q;
