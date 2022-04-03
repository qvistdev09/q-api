import { ErrorHandler } from "../errors/types";
import { Request, Response } from "../context";
import { RouteConfig, SegmentedMiddlewareFunctions } from "./types";
import { SchemaVal } from "../validation";
export declare class Route {
    segments: SegmentedMiddlewareFunctions;
    useAuth: boolean;
    reqBodySchema: SchemaVal | null;
    reqBodyRequireAllProperties: boolean;
    querySchema: SchemaVal | null;
    queryRequireAllProperties: boolean;
    paramsSchema: SchemaVal | null;
    constructor({ middlewares, useAuth }: RouteConfig);
    addRequestBodyValidation(schema: SchemaVal, requireAllProperties: boolean): this;
    addQueryValidationSchema(schema: SchemaVal, requireAllProperties: boolean): this;
    addParamsValidationSchema(schema: SchemaVal): this;
    runNextMiddleware(index: number, req: Request, res: Response, errorHandler: ErrorHandler): void;
    handleRequest(req: Request, res: Response, errorHandler: ErrorHandler): void;
}
