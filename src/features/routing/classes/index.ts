import { ErrorHandler } from "../../../base/types";
import { Request, Response } from "../../context";
import { Middleware } from "../../middleware";
import { SegmentedMiddlewareFunctions } from "../types";
import { assertRequiredDependencies, segmentDependencies } from "../utils";

export class Route {
  segments: SegmentedMiddlewareFunctions;

  constructor(middlewares: Middleware[]) {
    assertRequiredDependencies(middlewares);
    this.segments = segmentDependencies(middlewares);
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
    let index = 0;
    this.runNextMiddleware(index, req, res, errorHandler);
  }
}
