import { Api } from "./base";
import { ApiConfig } from "./base/types";
import { Middleware } from "./middleware";
import { MiddlewareFunction } from "./middleware/types";
import { Route } from "./routing";
import { RouteConfig } from "./routing/types";
import { NumberVal, StringVal, SchemaVal } from "./validation";
import { Schema } from "./validation/types";
declare const Q: {
    createApi: (config: ApiConfig) => Api;
    createRoute: (routeConfig: RouteConfig) => Route;
    createMiddleware: (middlewareFunction: MiddlewareFunction) => Middleware;
    loadEnv: (dotEnvPath: string) => void;
    val: {
        createSchema: (schema: Schema) => SchemaVal;
        number: () => NumberVal;
        string: () => StringVal;
    };
};
export default Q;
