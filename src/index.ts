import { Api } from "./base";
import { ApiConfig } from "./base/types";
import { loadEnv } from "./load-env";
import { Middleware } from "./middleware";
import { MiddlewareFunction } from "./middleware/types";
import { Route } from "./routing";
import { RouteConfig } from "./routing/types";
import { NumberVal, StringVal, SchemaVal } from "./validation";
import { Schema } from "./validation/types";

const Q = {
  createApi: (config: ApiConfig) => new Api(config),
  createRoute: (routeConfig: RouteConfig) => new Route(routeConfig),
  createMiddleware: (middlewareFunction: MiddlewareFunction) => new Middleware(middlewareFunction),
  loadEnv,
  val: {
    createSchema: (schema: Schema) => new SchemaVal(schema),
    number: () => new NumberVal(),
    string: () => new StringVal(),
  },
};

export default Q;
