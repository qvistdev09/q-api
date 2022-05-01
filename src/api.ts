import { BaseEndpoint } from "./base-endpoint";
import http from "http";
import { createError, defaultErrorHandler, ErrorHandler } from "./errors";
import { Authenticator, PemStore } from "./auth";
import { importEndpoints } from "./route-init";
import { Context } from "./context";
import { HttpMethodHandler } from "./http-method-handler";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Service {
  name: string;
  reference: any;
}

interface AuthConfig {
  auth0HostName: string;
  publicKeyCacheLimitInMinutes?: number;
}

const getMatchingEndpoint = (url: string, endpoints: BaseEndpoint[]) => {
  for (let endpoint of endpoints) {
    const matchResult = endpoint.urlMatcher?.(url);
    if (matchResult && matchResult.match) {
      return {
        endpoint,
        params: matchResult.params ?? {},
      };
    }
  }
  return null;
};

export class Api {
  services: Service[];
  endpoints: BaseEndpoint[];
  server: http.Server;
  errorHandler: ErrorHandler;
  authenticator: Authenticator;
  pemStore: PemStore;

  constructor(authConfig: AuthConfig) {
    this.services = [];
    this.pemStore = new PemStore({
      auth0HostName: authConfig.auth0HostName,
      cacheLimitInMinutes: authConfig.publicKeyCacheLimitInMinutes ?? 30,
    });
    this.authenticator = new Authenticator(this.pemStore);
    this.endpoints = [];
    this.errorHandler = defaultErrorHandler;
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
  }

  addServices(services: Service[]) {
    this.services = services;
    return this;
  }

  importEndpoints(basePath: string) {
    this.endpoints = importEndpoints(basePath, this.services);
    return this;
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const requestUrl = req.url?.replace(/\/*$/, "");
    const requestMethod = req.method ? (req.method as HttpMethod) : null;
    if (!requestUrl || !requestMethod) {
      return this.errorHandler(
        new Context(req, res),
        createError.badRequest("Invalid request URL or method")
      );
    }
    const matchingEndpoint = getMatchingEndpoint(requestUrl, this.endpoints);
    if (matchingEndpoint === null) {
      return this.errorHandler(new Context(req, res), createError.notFound("No matching route"));
    }
    const methodHandler = matchingEndpoint.endpoint[requestMethod];
    if (!methodHandler) {
      return this.errorHandler(
        new Context(req, res),
        createError.notFound("HTTP method not allowed")
      );
    }
    if (methodHandler instanceof HttpMethodHandler) {
    }
  }
}
