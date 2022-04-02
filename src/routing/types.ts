import { Middleware } from "../middleware";
import { MiddlewareFunction } from "../middleware/types";
import { QSchema } from "../validation";

export type SegmentedMiddlewareFunctions = Array<MiddlewareFunction[]>;

export interface RouteConfig {
  middlewares: Middleware[];
  useAuth: boolean;
  reqBodySchema?: QSchema;
  querySchema?: QSchema;
}
