import { BaseEndpoint } from "./base-endpoint";
import http from "http";
import url from "url";
import { createError, defaultErrorHandler, ErrorHandler } from "./errors";
import { Authenticator, PemStore } from "./auth";
import { importEndpoints } from "./route-init";
import { Context } from "./context";
import { HttpMethodHandler } from "./http-method-handler";
import { Schema, SchemaDerivedInterface } from "./validation/types";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Service {
  name: string;
  reference: any;
}

export interface AuthConfig {
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

  private parseReqBody(httpReq: http.IncomingMessage): Promise<object> {
    return new Promise((resolve, reject) => {
      let bodyString = "";
      httpReq.on("data", (chunk) => {
        bodyString += chunk.toString();
      });
      httpReq.on("error", (error) => {
        reject(error);
      });
      httpReq.on("end", () => {
        try {
          const parsedReqBody = JSON.parse(bodyString);
          resolve(parsedReqBody as object);
        } catch (err) {
          reject(createError.badRequest("Malformed JSON"));
        }
      });
    });
  }

  async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const context = new Context(req, res);
    try {
      const requestUrl = req.url?.replace(/\/*$/, "");
      const requestMethod = req.method ? (req.method as HttpMethod) : null;
      if (!requestUrl || !requestMethod) {
        return this.errorHandler(context, createError.badRequest("Invalid request URL or method"));
      }
      const matchingEndpoint = getMatchingEndpoint(requestUrl, this.endpoints);
      if (matchingEndpoint === null) {
        return this.errorHandler(context, createError.notFound("No matching route"));
      }
      const methodHandler = matchingEndpoint.endpoint[requestMethod];
      if (!methodHandler || !methodHandler.handlerFunction) {
        return this.errorHandler(context, createError.notFound("HTTP method not allowed"));
      }
      if (methodHandler instanceof HttpMethodHandler) {
        let reqBody = await this.parseReqBody(req);
        let reqQuery = url.parse(requestUrl, true).query ?? {};
        let reqParams = matchingEndpoint.params;
        console.log(
          JSON.stringify(
            {
              reqBody,
              reqQuery,
              reqParams,
            },
            null,
            2
          )
        );
        if (methodHandler.bodySchema) {
          const reqBodyValidation = methodHandler.bodySchema.validateObject(reqBody, "body");
          if (reqBodyValidation.errors.length > 0) {
            return this.errorHandler(
              context,
              createError.validationError("Invalid request body", reqBodyValidation.errors)
            );
          }
          reqBody = reqBodyValidation.data;
        }
        if (methodHandler.querySchema) {
          const reqQueryValidation = methodHandler.querySchema.validateObject(reqQuery, "query");
          if (reqQueryValidation.errors.length > 0) {
            return this.errorHandler(
              context,
              createError.validationError("Invalid request query", reqQueryValidation.errors)
            );
          }
          reqQuery = reqQueryValidation.data;
        }
        if (methodHandler.paramsSchema) {
          const reqParamsValidation = methodHandler.paramsSchema.validateObject(reqParams, "path");
          if (reqParamsValidation.errors.length > 0) {
            return this.errorHandler(
              context,
              createError.validationError("Invalid URL params", reqParamsValidation.errors)
            );
          }
          reqParams = reqParamsValidation.data;
        }
        context.body = reqBody as SchemaDerivedInterface<Schema>;
        context.params = reqParams as SchemaDerivedInterface<Schema>;
        context.query = reqQuery as SchemaDerivedInterface<Schema>;
        const methodHandlerOutput = await methodHandler.handlerFunction(context);
        res.writeHead(methodHandlerOutput.statusCode, { "Content-Type": "application/json" });
        res.end(JSON.stringify(methodHandlerOutput.data));
      } else {
        return this.errorHandler(context, createError.notFound("Not implemented"));
      }
    } catch (err) {
      this.errorHandler(context, err);
    }
  }

  listen(port: number) {
    this.server.listen(port, () => {
      console.log(`Qvistdev API is listening on port ${port}`);
    });
  }
}
