import { Request, Response } from "../../features/context";
import { Route } from "../../features/routing/classes";

export interface ParamsMatch {
  [paramIdentifier: string]: string;
}

export interface UrlMatcherResult {
  match: boolean;
  params?: ParamsMatch;
}

export type ErrorHandler = (req: Request, res: Response, err: any) => void;

export interface ImportedRoutes {
  GET?: Route;
  POST?: Route;
  PUT?: Route;
  PATCH?: Route;
  DELETE?: Route;
}

export interface Endpoint {
  matcher: (requestUrl: string) => UrlMatcherResult;
  methods: {
    GET?: Route;
    POST?: Route;
    PUT?: Route;
    PATCH?: Route;
    DELETE?: Route;
  };
}
