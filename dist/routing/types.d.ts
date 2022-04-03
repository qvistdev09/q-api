import { Middleware } from "../middleware";
import { MiddlewareFunction } from "../middleware/types";
export declare type SegmentedMiddlewareFunctions = Array<MiddlewareFunction[]>;
export interface RouteConfig {
    middlewares: Middleware[];
    useAuth: boolean;
}
