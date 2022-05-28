import { MethodHandler, MethodHandlerConfig } from "./http-method-handler";
import { UrlMatcherResult } from "./route-init";
import { Schema } from "./validation/types";
export declare class BaseEndpoint {
    static services: string[];
    GET?: MethodHandler;
    POST?: MethodHandler;
    PUT?: MethodHandler;
    PATCH?: MethodHandler;
    DELETE?: MethodHandler;
    urlMatcher?: (url: string) => UrlMatcherResult;
    createMethodHandler<BodySchema extends Schema, ParamsSchema extends Schema, QuerySchema extends Schema>(handlerConfig: MethodHandlerConfig<BodySchema, ParamsSchema, QuerySchema>): MethodHandler;
}
