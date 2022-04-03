import { Middleware } from "../middleware";
import { SegmentedMiddlewareFunctions } from "./types";
export declare const assertRequiredDependencies: (middlewares: Middleware[]) => void;
export declare const segmentDependencies: (middlewares: Middleware[]) => SegmentedMiddlewareFunctions;
