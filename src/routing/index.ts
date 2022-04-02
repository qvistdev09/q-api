import { ErrorHandler } from "../errors/types";
import { Request, Response } from "../context";
import { RouteConfig, SegmentedMiddlewareFunctions } from "./types";
import { assertRequiredDependencies, segmentDependencies } from "./utils";
import { QSchema } from "../validation";
import { createError } from "../errors";

export class Route {
  segments: SegmentedMiddlewareFunctions;
  useAuth: boolean;
  reqBodySchema: QSchema | null;
  querySchema: QSchema | null;
  paramsSchema: QSchema | null;

  constructor({ middlewares, useAuth, reqBodySchema, querySchema, paramsSchema }: RouteConfig) {
    assertRequiredDependencies(middlewares);
    this.useAuth = useAuth;
    this.segments = segmentDependencies(middlewares);
    this.reqBodySchema = reqBodySchema || null;
    this.querySchema = querySchema || null;
    this.paramsSchema = paramsSchema || null;
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
      const validationErrors = this.reqBodySchema.validateObject(req.body);
      if (validationErrors.length > 0) {
        errorHandler(
          req,
          res,
          createError.validationError("Invalid request body", validationErrors)
        );
        return;
      }
    }
    let index = 0;
    this.runNextMiddleware(index, req, res, errorHandler);
  }
}
