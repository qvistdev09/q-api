import { ErrorHandler } from "../errors/types";
import { Request, Response } from "../context";
import { RouteConfig, SegmentedMiddlewareFunctions } from "./types";
import { assertRequiredDependencies, segmentDependencies } from "./utils";
import { createError } from "../errors";
import { SchemaVal } from "../validation";

export class Route {
  segments: SegmentedMiddlewareFunctions;
  useAuth: boolean;
  reqBodySchema: SchemaVal | null;
  reqBodyRequireAllProperties: boolean;
  querySchema: SchemaVal | null;
  queryRequireAllProperties: boolean;
  paramsSchema: SchemaVal | null;

  constructor({ middlewares, useAuth }: RouteConfig) {
    assertRequiredDependencies(middlewares);
    this.useAuth = useAuth;
    this.segments = segmentDependencies(middlewares);
    this.reqBodySchema = null;
    this.querySchema = null;
    this.paramsSchema = null;
    this.reqBodyRequireAllProperties = true;
    this.queryRequireAllProperties = true;
  }

  addRequestBodyValidation(schema: SchemaVal, requireAllProperties: boolean) {
    this.reqBodySchema = schema;
    this.reqBodyRequireAllProperties = requireAllProperties;
    return this;
  }

  addQueryValidationSchema(schema: SchemaVal, requireAllProperties: boolean) {
    this.querySchema = schema;
    this.queryRequireAllProperties = requireAllProperties;
    return this;
  }

  addParamsValidationSchema(schema: SchemaVal) {
    this.paramsSchema = schema;
    return this;
  }

  runNextMiddleware(index: number, req: Request, res: Response, errorHandler: ErrorHandler) {
    const scheduledSegment = this.segments[index];
    index++;
    if (scheduledSegment) {
      Promise.all(scheduledSegment.map((middlewareFunction) => middlewareFunction(req, res)))
        .then(() => {
          this.runNextMiddleware(index, req, res, errorHandler);
        })
        .catch((err) => {
          errorHandler(req, res, err);
        });
      return;
    }
    if (res.responseData && res.statusCode) {
      res.httpRes.writeHead(res.statusCode, { "Content-Type": "application/json" });
      res.httpRes.end(JSON.stringify(res.responseData));
      return;
    }
    errorHandler(req, res, new Error("Route has no set response"));
  }

  handleRequest(req: Request, res: Response, errorHandler: ErrorHandler) {
    if (this.reqBodySchema) {
      const { errors, object } = this.reqBodySchema.validateObject(
        req.body,
        this.reqBodyRequireAllProperties,
        "body"
      );
      if (errors.length > 0) {
        errorHandler(req, res, createError.validationError("Invalid request body", errors));
        return;
      } else {
        req.body = object;
      }
    }
    if (this.querySchema) {
      const { errors, object } = this.querySchema.validateObject(
        req.query,
        this.queryRequireAllProperties,
        "query"
      );
      if (errors.length > 0) {
        errorHandler(req, res, createError.validationError("Invalid query", errors));
        return;
      } else {
        req.query = object;
      }
    }
    if (this.paramsSchema) {
      const { errors, object } = this.paramsSchema.validateObject(req.params, true, "path");
      if (errors.length > 0) {
        errorHandler(req, res, createError.validationError("Invalid params", errors));
        return;
      } else {
        req.params = object;
      }
    }
    let index = 0;
    this.runNextMiddleware(index, req, res, errorHandler);
  }
}
