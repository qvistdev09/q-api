import { Middleware } from "../../middleware";
import { SegmentedMiddlewareFunctions } from "../types";

export const assertRequiredDependencies = (middlewares: Middleware[]) => {
  middlewares.forEach((middleware) => {
    middleware.dependencies.forEach((dependency) => {
      if (!middlewares.some((includedDependency) => includedDependency === dependency)) {
        throw new Error(
          `Middleware dependency missing: ${dependency.middlewareFunction.toString()}`
        );
      }
    });
  });
};

export const segmentDependencies = (middlewares: Middleware[]): SegmentedMiddlewareFunctions => {
  let remainingMiddlewares = [...middlewares];
  const segments: Array<Middleware[]> = [[]];
  while (remainingMiddlewares.length > 0) {
    let iteration = [...remainingMiddlewares];
    remainingMiddlewares.forEach((middleware) => {
      let remainingDeps = [...middleware.dependencies];
      let middlewarePlaced = false;
      segments.forEach((segment) => {
        if (remainingDeps.length === 0 && !middlewarePlaced) {
          segment.push(middleware);
          middlewarePlaced = true;
        } else {
          segment.forEach((placedMiddleware) => {
            remainingDeps = remainingDeps.filter((dependency) => dependency !== placedMiddleware);
          });
        }
      });
      if (!middlewarePlaced && remainingDeps.length === 0) {
        segments.push([middleware]);
        middlewarePlaced = true;
      }
      if (middlewarePlaced) {
        iteration = iteration.filter((nonplacedMiddleware) => nonplacedMiddleware !== middleware);
      }
    });
    remainingMiddlewares = iteration;
  }
  return segments.map((segment) => segment.map((middleware) => middleware.middlewareFunction));
};
