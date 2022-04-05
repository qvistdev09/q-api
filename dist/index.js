"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const errors_1 = require("./errors");
const load_env_1 = require("./load-env");
const middleware_1 = require("./middleware");
const routing_1 = require("./routing");
const validation_1 = require("./validation");
const Q = {
    createApi: (config) => new base_1.Api(config),
    createRoute: (routeConfig) => new routing_1.Route(routeConfig),
    createMiddleware: (middlewareFunction) => new middleware_1.Middleware(middlewareFunction),
    loadEnv: load_env_1.loadEnv,
    createError: errors_1.createError,
    val: {
        createSchema: (schema) => new validation_1.SchemaVal(schema),
        number: () => new validation_1.NumberVal(),
        string: () => new validation_1.StringVal(),
        boolean: () => new validation_1.BooleanVal(),
        array: (validator) => new validation_1.ArrayVal(validator),
    },
};
exports.default = Q;
//# sourceMappingURL=index.js.map