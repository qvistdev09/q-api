import { Qreq, Qres } from "./features/request";

export interface ParamsMatch {
  [paramIdentifier: string]: string;
}

export interface UrlMatcherResult {
  match: boolean;
  params?: ParamsMatch;
}

export type MiddleWare = (req: Qreq, res: Qres, next?: (error?: any) => void) => void;

export interface RequestHandler {
  matcher: (requestUrl: string) => UrlMatcherResult;
  methods: {
    GET?: MiddleWare;
    POST?: MiddleWare;
    PUT?: MiddleWare;
    PATCH?: MiddleWare;
    DELETE?: MiddleWare;
  };
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RouteConfig {
  GET?: Array<MiddleWare>;
  POST?: Array<MiddleWare>;
  PUT?: Array<MiddleWare>;
  PATCH?: Array<MiddleWare>;
  DELETE?: Array<MiddleWare>;
}
