import { Route } from "../routing";

export interface ParamsMatch {
  [paramIdentifier: string]: string;
}

export interface UrlMatcherResult {
  match: boolean;
  params?: ParamsMatch;
}

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

interface AuthConfig {
  auth0HostName: string;
  publicKeyCacheLimitInMinutes?: number;
}

export interface ApiConfig {
  basePath: string;
  authConfig: AuthConfig;
}
