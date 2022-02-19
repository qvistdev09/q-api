import { Api } from "./base";
import { ApiConfig } from "./base/types";
import { loadEnv } from "./load-env";
import { Middleware } from "./middleware";
import { MiddlewareFunction } from "./middleware/types";
import { Route } from "./routing";
import { RouteConfig } from "./routing/types";

const Q = {
  createApi: (config: ApiConfig) => new Api(config),
  createRoute: (routeConfig: RouteConfig) => new Route(routeConfig),
  createMiddleware: (middlewareFunction: MiddlewareFunction) => new Middleware(middlewareFunction),
  loadEnv,
};

export default Q;
