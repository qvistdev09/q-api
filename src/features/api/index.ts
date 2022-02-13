import http from "http";
import url from "url";
import { httpMethods } from "../../consts";
import { Response, Request } from "../context";
import { createRouteHandler, createUrlMatcherFunction, getNestedContents } from "../routing";
import { HttpMethod, MiddleWare, RequestHandler, RouteConfig } from "../../types";

export class Api {
  handlers: Array<RequestHandler>;
  server: http.Server;
  errorHandler: (req: Request, res: Response) => void;

  constructor(basePath: string, errorHandler: (req: Request, res: Response) => void) {
    this.handlers = [];
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
    this.errorHandler = errorHandler;
    getNestedContents(basePath).forEach((file) => {
      const routeConfig = require(file) as RouteConfig;
      const routeHandler: RequestHandler = {
        matcher: createUrlMatcherFunction(basePath, file),
        methods: {},
      };
      httpMethods.forEach((method) => {
        if (routeConfig[method]) {
          const middlewares = routeConfig[method] as Array<MiddleWare>;
          routeHandler.methods[method] = createRouteHandler(middlewares, this.errorHandler);
        }
      });
      this.handlers.push(routeHandler);
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

  handleRequest(httpReq: http.IncomingMessage, httpRes: http.ServerResponse) {
    const requestUrl = httpReq.url;
    const requestMethod = httpReq.method ? (httpReq.method as HttpMethod) : null;
    if (!requestUrl || !requestMethod) {
      return this.badRequest(httpRes, "Invalid request");
    }

    const matchingHandler = this.handlers.find(
      (requestHandler) => requestHandler.matcher(requestUrl).match
    );

    if (!matchingHandler) {
      return this.noRoute(httpRes);
    }

    const routeMiddleware = matchingHandler.methods[requestMethod];

    if (!routeMiddleware) {
      return this.noRoute(httpRes);
    }

    let bodyString = "";
    httpReq.on("data", (chunk) => {
      bodyString += chunk.toString();
    });
    httpReq.on("end", () => {
      try {
        const reqBody = JSON.parse(bodyString);
        const reqQuery = url.parse(requestUrl, true).query;
        const reqParams = matchingHandler.matcher(requestUrl).params || {};
        const req = new Request(reqBody, reqQuery, reqParams);
        const res = new Response(httpRes);
        routeMiddleware(req, res);
      } catch (err) {
        console.log(err);
        this.badRequest(httpRes, "Invalid request: malformed JSON");
      }
    });
  }

  listen(port: number) {
    this.server.listen(port, () => {
      console.log(`Qvistdev API is listening on port ${port}`);
    });
  }
}
