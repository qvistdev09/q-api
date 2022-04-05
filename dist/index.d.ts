import { Api } from "./base";
import { ApiConfig } from "./base/types";
import { Middleware } from "./middleware";
import { MiddlewareFunction } from "./middleware/types";
import { Route } from "./routing";
import { RouteConfig } from "./routing/types";
import { NumberVal, StringVal, SchemaVal, BooleanVal, ArrayVal } from "./validation";
import { Schema } from "./validation/types";
declare const Q: {
    createApi: (config: ApiConfig) => Api;
    createRoute: (routeConfig: RouteConfig) => Route;
    createMiddleware: (middlewareFunction: MiddlewareFunction) => Middleware;
    loadEnv: (dotEnvPath: string) => void;
    createError: {
        badRequest: (message: string) => import("./errors").ApiError;
        unauthorized: (message: string) => import("./errors").ApiError;
        forbidden: (message: string) => import("./errors").ApiError;
        notFound: (message: string) => import("./errors").ApiError;
        methodNotAllowed: (message: string) => import("./errors").ApiError;
        validationError: (message: string, errors: import("./validation/types").ValidationError[]) => import("./errors").ApiError;
    };
    val: {
        createSchema: (schema: Schema) => SchemaVal;
        number: () => NumberVal;
        string: () => StringVal;
        boolean: () => BooleanVal;
        array: (validator: NumberVal | StringVal | BooleanVal) => ArrayVal;
    };
};
export default Q;
