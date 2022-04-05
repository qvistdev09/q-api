import http from "http";
import url from "url";
import { contentTypeJSON, getEndpointsFromFiles } from "./utils";
import { HttpMethod } from "../types";
import { ApiConfig, Endpoint } from "./types";
import { Authenticator, PemStore } from "../auth";
import { createError, defaultErrorHandler } from "../errors";
import { ErrorHandler } from "../errors/types";
import { Request, Response } from "../context";
import { Route } from "../routing";

export class Api {
  endpoints: Array<Endpoint>;
  server: http.Server;
  errorHandler: ErrorHandler;
  authenticator: Authenticator;
  pemStore: PemStore;

  constructor({ basePath, authConfig }: ApiConfig) {
    this.pemStore = new PemStore({
      auth0HostName: authConfig.auth0HostName,
      cacheLimitInMinutes: authConfig.publicKeyCacheLimitInMinutes || 30,
    });
    this.authenticator = new Authenticator(this.pemStore);
    this.endpoints = [];
    this.server = http.createServer((req, res) => this.forwardRequest(req, res));
    this.errorHandler = defaultErrorHandler;
    this.endpoints = getEndpointsFromFiles(basePath);
  }

  parseReqBody(httpReq: http.IncomingMessage): Promise<object> {
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

  async prepareRequest(
    req: Request,
    useAuth: boolean,
    requestUrl: string,
    matchingEndpoint: Endpoint
  ) {
    try {
      req.body = contentTypeJSON(req.httpReq) ? await this.parseReqBody(req.httpReq) : {};
      req.user = useAuth ? await this.authenticator.authenticateRequest(req.httpReq) : null;
      req.query = url.parse(requestUrl, true).query;
      req.params = matchingEndpoint.matcher(requestUrl).params || {};
      return;
    } catch (err) {
      throw err;
    }
  }

  forwardRequest(httpReq: http.IncomingMessage, httpRes: http.ServerResponse) {
    const req = new Request(httpReq);
    const res = new Response(httpRes);

    const requestUrl = httpReq.url?.replace(/\/*$/, "");
    const requestMethod = httpReq.method ? (httpReq.method as HttpMethod) : null;
    if (!requestUrl || !requestMethod) {
      this.errorHandler(req, res, createError.badRequest("Invalid request URL or method"));
      return;
    }

    const matchingEndpoint = this.endpoints.find((endpoint) => endpoint.matcher(requestUrl).match);

    if (!matchingEndpoint) {
      this.errorHandler(req, res, createError.notFound("No matching route"));
      return;
    }

    const matchingRoute = matchingEndpoint.methods[requestMethod];

    if (!matchingRoute || !(matchingRoute instanceof Route)) {
      this.errorHandler(req, res, createError.methodNotAllowed("HTTP method not allowed"));
      return;
    }

    this.prepareRequest(req, matchingRoute.useAuth, requestUrl, matchingEndpoint)
      .then(() => {
        matchingRoute.handleRequest(req, res, this.errorHandler);
      })
      .catch((err) => this.errorHandler(req, res, err));
  }

  listen(port: number) {
    this.server.listen(port, () => {
      console.log(`Qvistdev API is listening on port ${port}`);
    });
  }
}
