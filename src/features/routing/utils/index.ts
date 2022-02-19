import { Middleware } from "../../middleware";
import { SegmentedMiddlewares } from "../types";

export const segmentDependencies = (middlewares: Middleware[]): SegmentedMiddlewares => {
  let remainingMiddlewares = [...middlewares];
  const segments: SegmentedMiddlewares = [[]];
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
  return segments;
};
