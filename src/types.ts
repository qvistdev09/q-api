import { Request, Response } from "./features/context";
import { QBaseValidator } from "./features/validation";

export interface ParamsMatch {
  [paramIdentifier: string]: string;
}

export interface UrlMatcherResult {
  match: boolean;
  params?: ParamsMatch;
}

export type MiddleWare = (req: Request, res: Response, next?: (error?: any) => void) => void;

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

export interface DecodedUser {
  iss: string;
  sub: string;
  aud: Array<string>;
  iat: number;
  exp: number;
  azp: string;
  scope: string;
}

export interface ValidationError {
  property: string;
  error: string;
}

export type PropertyValidator = (identifier: string, value: any) => ValidationError | null;

export interface PairedValidator {
  validator: QBaseValidator;
  path: Array<string>;
}
