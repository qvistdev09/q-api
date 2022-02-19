import http from "http";
import url from "url";
import { httpMethods } from "../../consts";
import { Response, Request } from "../../features/context";
import { createUrlMatcherFunction, getNestedContents } from "../utils";
import { HttpMethod } from "../../types";
import { Endpoint, ErrorHandler, ImportedRoutes } from "../types";

export class Api {
  endpoints: Array<Endpoint>;
  server: http.Server;
  errorHandler: ErrorHandler;

  constructor(basePath: string) {
    this.endpoints = [];
    this.server = http.createServer((req, res) => this.forwardRequest(req, res));
    this.errorHandler = (req, res, err) => {
      console.log(err);
      res.httpRes.writeHead(500, { "Content-Type": "application/json" });
      res.httpRes.end(JSON.stringify({ error: "Server error" }));
      return;
    };
    getNestedContents(basePath).forEach((file) => {
      const routeConfig = require(file) as ImportedRoutes;
      const endpoint: Endpoint = {
        matcher: createUrlMatcherFunction(basePath, file),
        methods: {},
      };
      httpMethods.forEach((method) => {
        if (routeConfig[method]) {
          endpoint.methods[method] = routeConfig[method];
        }
      });
      this.endpoints.push(endpoint);
    });
  }

  badRequest(res: http.ServerResponse, message: string) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: message }));
  }

  noRoute(res: http.ServerResponse) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "No matching route" }));
  }

  forwardRequest(httpReq: http.IncomingMessage, httpRes: http.ServerResponse) {
    const requestUrl = httpReq.url;
    const requestMethod = httpReq.method ? (httpReq.method as HttpMethod) : null;
    if (!requestUrl || !requestMethod) {
      return this.badRequest(httpRes, "Invalid request");
    }

    const matchingEndpoint = this.endpoints.find((endpoint) => endpoint.matcher(requestUrl).match);

    if (!matchingEndpoint) {
      return this.noRoute(httpRes);
    }

    const matchingRoute = matchingEndpoint.methods[requestMethod];

    if (!matchingRoute) {
      return this.noRoute(httpRes);
    }

    if (
      httpReq.headers["content-type"] &&
      httpReq.headers["content-type"].toLowerCase() === "application/json"
    ) {
      let bodyString = "";
      httpReq.on("data", (chunk) => {
        bodyString += chunk.toString();
      });
      httpReq.on("end", () => {
        try {
          const reqBody = JSON.parse(bodyString);
          const reqQuery = url.parse(requestUrl, true).query;
          const reqParams = matchingEndpoint.matcher(requestUrl).params || {};
          const req = new Request(reqBody, reqQuery, reqParams);
          const res = new Response(httpRes);
          matchingRoute.handleRequest(req, res, this.errorHandler);
        } catch (err) {
          this.badRequest(httpRes, "Invalid request: malformed JSON");
        }
      });
    } else {
      const reqQuery = url.parse(requestUrl, true).query;
      const reqParams = matchingEndpoint.matcher(requestUrl).params || {};
      const req = new Request({}, reqQuery, reqParams);
      const res = new Response(httpRes);
      matchingRoute.handleRequest(req, res, this.errorHandler);
    }
  }

  listen(port: number) {
    this.server.listen(port, () => {
      console.log(`Qvistdev API is listening on port ${port}`);
    });
  }
}
