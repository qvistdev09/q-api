import { BaseEndpoint } from "./base-endpoint";
import http from "http";
import { URL } from "url";
import { createError, defaultErrorHandler, ErrorHandler } from "./errors";
import { Authenticator, PemStore } from "./auth";
import { importEndpoints } from "./route-init";
import { AuthedContext, Context } from "./context";
import { AuthedHttpMethodHandler, HttpMethodHandler } from "./http-method-handler";
import { DataSource } from "./validation/types";
import { SchemaValidation } from "./validation/schema";

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
    const context =
      methodHandler instanceof AuthedHttpMethodHandler
        ? new AuthedContext(req, res, await this.authenticator.authenticateRequest(req))
        : new Context(req, res);
    context.body = await parseRequestBody(req);
    context.query = getQueryObjectFromUrl(url);
    context.params = endpointMatch.params as any;
    performNecessaryValidations(getNecessaryValidations(methodHandler, context), context);
    if (methodHandler instanceof AuthedHttpMethodHandler && methodHandler.authedHandlerFunction) {
      return methodHandler.authedHandlerFunction(context as AuthedContext);
    }
    if (methodHandler.handlerFunction) {
      return methodHandler.handlerFunction(context);
    }
    throw new Error("Missing handler function");
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    this.getHandlerResponse(req, res)
      .then((handlerResponse) => {
        jsonRespond(res, handlerResponse.data, handlerResponse.statusCode);
      })
      .catch((error) => {
        this.errorHandler(new Context(req, res), error);
      });
  }

  listen(port: number) {
    this.server.listen(port, () => {
      console.log(`API is listening on port ${port}`);
    });
  }
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

interface ValidationOrder {
  source: DataSource;
  schema: SchemaValidation;
  data: any;
  messageOnFail: string;
  originalPath: "body" | "params" | "query";
}

function getNecessaryValidations(handler: HttpMethodHandler, context: Context) {
  const validations: Array<ValidationOrder> = [];
  if (handler.bodySchema) {
    validations.push({
      source: "body",
      schema: handler.bodySchema,
      data: context.body,
      messageOnFail: "Invalid request body",
      originalPath: "body",
    });
  }
  if (handler.paramsSchema) {
    validations.push({
      source: "path",
      schema: handler.paramsSchema,
      data: context.params,
      messageOnFail: "Invalid params in request URL",
      originalPath: "params",
    });
  }
  if (handler.querySchema) {
    validations.push({
      source: "query",
      schema: handler.querySchema,
      data: context.query,
      messageOnFail: "Invalid request query",
      originalPath: "query",
    });
  }
  return validations;
}

function performNecessaryValidations(validations: Array<ValidationOrder>, context: Context) {
  validations.forEach((validation) => {
    const { source, schema, data, messageOnFail, originalPath } = validation;
    const result = schema.validateObject(data, source);
    if (result.errors.length > 0) {
      throw createError.validationError(messageOnFail, result.errors);
    }
    context[originalPath] = result.data;
  });
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
