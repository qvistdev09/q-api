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

  constructor(apiConfig: ApiConfig) {
    this.services = apiConfig.services;
    this.endpoints = importEndpoints(apiConfig.basePath, this.services);
    this.authenticator = new Authenticator(
      new PemStore({
        auth0HostName: apiConfig.authConfig.auth0HostName,
        cacheLimitInMinutes: apiConfig.authConfig.publicKeyCacheLimitInMinutes ?? 30,
      })
    );
    this.errorHandler = defaultErrorHandler;
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
  }

  async getHandlerResult(req: http.IncomingMessage, res: http.ServerResponse) {
    let context: Context = new Context(req, res);
    try {
      context.body = await parseRequestBody(req);
      context.query = getQueryObjectFromUrl(req.url);
      const endpointMatch = getMatchingEndpoint(req, this.endpoints);
      context.params = endpointMatch.params;
      const { methodHandler, method } = getMethodHandlerOnEndpoint(req, endpointMatch.endpoint);
      if (methodHandler.useAuth) {
        context = new AuthedContext(context, await this.authenticator.authenticateRequest(req));
      }
      performValidations(methodHandler, context);
      const handlerData = await methodHandler.handlerFunction(context as any);
      return {
        data: handlerData,
        statusCode: getStatusCode(method, handlerData),
      };
    } catch (error) {
      throw new ContextBoundError(context, error);
    }
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    this.getHandlerResult(req, res)
      .then(({ data, statusCode }) => {
        if (data !== undefined) {
          jsonRespond(res, data, statusCode);
        } else {
          statusCodeRespond(res, statusCode);
        }
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
        throw createError.validationError(
          `Request validation error in: ${source}`,
          validationResult.errors
        );
      }
    }
  });
}

const supportedMethods = ["GET", "PUT", "POST", "DELETE", "PATCH"] as const;

function validRequestMethod(method: string | undefined): method is HttpMethod {
  return supportedMethods.includes(method as any);
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

function getQueryObjectFromUrl(url: string | undefined) {
  if (!url) {
    return {};
  }
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

function statusCodeRespond(res: http.ServerResponse, statusCode: number) {
  res.writeHead(statusCode).end();
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

function findEndpoint(url: string, endpoints: BaseEndpoint[]) {
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

function getMatchingEndpoint(req: http.IncomingMessage, endpoints: BaseEndpoint[]) {
  const { url } = req;
  if (typeof url !== "string") {
    throw createError.badRequest("Invalid request URL");
  }
  const endpointMatch = findEndpoint(url, endpoints);
  if (endpointMatch === null) {
    throw createError.notFound("No matching endpoint");
  }
  return endpointMatch;
}

function getMethodHandlerOnEndpoint(req: http.IncomingMessage, endpoint: BaseEndpoint) {
  const { method } = req;
  if (!validRequestMethod(method)) {
    throw createError.badRequest("Invalid request method");
  }
  const methodHandler = endpoint[method];
  if (!methodHandler) {
    throw createError.methodNotAllowed("Method not allowed on this endpoint");
  }
  return { methodHandler, method };
}

const statusCodes: {
  data: Record<HttpMethod, number>;
  noData: Record<HttpMethod, number>;
} = {
  data: {
    GET: 200,
    PUT: 200,
    POST: 201,
    DELETE: 200,
    PATCH: 200,
  },
  noData: {
    GET: 204,
    PUT: 204,
    POST: 204,
    DELETE: 204,
    PATCH: 204,
  },
};

function getStatusCode(method: HttpMethod, data: any) {
  if (data !== undefined) {
    return statusCodes.data[method];
  }
  return statusCodes.noData[method];
}

export type HttpMethod = typeof supportedMethods[number];

export interface Service {
  name: string;
  reference: any;
}

export interface AuthConfig {
  auth0HostName: string;
  publicKeyCacheLimitInMinutes?: number;
}

export interface ApiConfig {
  authConfig: AuthConfig;
  basePath: string;
  services: Service[];
}

class ContextBoundError {
  constructor(public context: Context, public error: any) {}
}
