import { BaseEndpoint } from "./base-endpoint";
import http from "http";
import { URL } from "url";
import { createError, defaultErrorHandler, ErrorHandler } from "./errors";
import { Authenticator, PemStore } from "./auth";
import { importEndpoints } from "./route-init";
import { AuthedContext, Context } from "./context";
import { MethodHandler } from "./http-method-handler";

export class Api {
  services: Service[];
  endpoints: BaseEndpoint[];
  server: http.Server;
  errorHandler: ErrorHandler;
  authenticator: Authenticator;

  constructor(authConfig: AuthConfig) {
    this.endpoints = [];
    this.services = [];
    this.authenticator = new Authenticator(
      new PemStore({
        auth0HostName: authConfig.auth0HostName,
        cacheLimitInMinutes: authConfig.publicKeyCacheLimitInMinutes ?? 30,
      })
    );
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

  async getHandlerResponse(req: http.IncomingMessage, res: http.ServerResponse) {
    let context: Context = new Context(req, res);
    try {
      const { url, method } = req;
      if (typeof url !== "string") {
        throw new Error("Invalid request URL");
      }
      if (!validRequestMethod(method)) {
        throw new Error("Invalid request method");
      }
      const endpointMatch = getMatchingEndpoint(url, this.endpoints);
      if (endpointMatch === null) {
        throw new Error("No matching endpoint");
      }
      const methodHandler = endpointMatch.endpoint[method];
      if (!methodHandler) {
        throw new Error("Http method not supported");
      }
      if (methodHandler.useAuth) {
        context = new AuthedContext(req, res, await this.authenticator.authenticateRequest(req));
      }
      context.body = await parseRequestBody(req);
      context.query = getQueryObjectFromUrl(url);
      context.params = endpointMatch.params as any;
      performValidations(methodHandler, context);
      return await methodHandler.handlerFunction(context as any);
    } catch (error) {
      throw new ContextBoundError(context, error);
    }
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    this.getHandlerResponse(req, res)
      .then((handlerResponse) => {
        jsonRespond(res, handlerResponse.data, handlerResponse.statusCode);
      })
      .catch((error) => {
        if (error instanceof ContextBoundError) {
          this.errorHandler(error.context, error.error);
        } else {
          this.errorHandler(new Context(req, res), error);
        }
      });
  }

  listen(port: number) {
    this.server.listen(port, () => {
      console.log(`API is listening on port ${port}`);
    });
  }
}

export const dataSourcesToValidate = ["body", "params", "query"] as const;

function performValidations(methodHandler: MethodHandler, context: Context) {
  dataSourcesToValidate.forEach((source) => {
    const validationSchema = methodHandler.schemas[source];
    if (validationSchema) {
      const data = context[source];
      const validationResult = validationSchema.validateObject(data, source);
      if (validationResult.errors.length > 0) {
        throw createError.validationError("message on fail", validationResult.errors);
      }
    }
  });
}

const supportedMethods = ["GET", "PUT", "POST", "DELETE", "PATCH"];
function validRequestMethod(method: string | undefined): method is HttpMethod {
  return supportedMethods.includes(method as string);
}

function getMatchingEndpoint(url: string, endpoints: BaseEndpoint[]) {
  const cleanedUrl = url.replace(/\/*$/, "");
  for (let endpoint of endpoints) {
    const matchResult = endpoint.urlMatcher?.(cleanedUrl);
    if (matchResult && matchResult.match) {
      return {
        endpoint,
        params: matchResult.params ?? {},
      };
    }
  }
  return null;
}

function parseRequestBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!requestContentTypeIsJSON(req)) {
      return resolve({});
    }
    const data: Uint8Array[] = [];
    req.on("data", (chunk) => data.push(chunk));
    req.on("end", () => {
      try {
        const parsedRequestBody = JSON.parse(Buffer.concat(data).toString());
        resolve(parsedRequestBody);
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", (error) => reject(error));
  });
}

function getQueryObjectFromUrl(url: string) {
  try {
    const urlObject = new URL(url);
    const query = {} as any;
    urlObject.searchParams.forEach((value, name) => {
      query[name] = value;
    });
    return query;
  } catch (err) {
    return {};
  }
}

function jsonRespond(res: http.ServerResponse, data: any, statusCode: number) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function requestContentTypeIsJSON(httpReq: http.IncomingMessage) {
  if (
    httpReq.headers["content-type"] &&
    httpReq.headers["content-type"].toLowerCase() === "application/json"
  ) {
    return true;
  }
  return false;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Service {
  name: string;
  reference: any;
}

export interface AuthConfig {
  auth0HostName: string;
  publicKeyCacheLimitInMinutes?: number;
}

class ContextBoundError {
  constructor(public context: Context, public error: any) {}
}
