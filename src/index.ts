import http from "http";
import url from "url";
import { httpMethods } from "./features/consts";
import { Qreq, Qres } from "./features/request";
import {
  createRouteHandler,
  createUrlMatcherFunction,
  getNestedContents,
} from "./features/routing";
import { HttpMethod, MiddleWare, RequestHandler, RouteConfig } from "./types";

export class Q_API {
  handlers: Array<RequestHandler>;
  server: http.Server;
  errorHandler: (req: Qreq, res: Qres) => void;

  constructor(basePath: string, errorHandler: (req: Qreq, res: Qres) => void) {
    this.handlers = [];
    this.server = http.createServer(this.handleRequest);
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

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const requestUrl = req.url;
    const requestMethod = req.method ? (req.method as HttpMethod) : null;
    if (!requestUrl || !requestMethod) {
      return this.badRequest(res, "Invalid request");
    }

    const matchingHandler = this.handlers.find(
      (requestHandler) => requestHandler.matcher(requestUrl).match
    );

    if (!matchingHandler) {
      return this.noRoute(res);
    }

    const routeMiddleware = matchingHandler.methods[requestMethod];

    if (!routeMiddleware) {
      return this.noRoute(res);
    }

    let bodyString: any;
    req.on("data", (chunk) => {
      bodyString += chunk.toString();
    });
    req.on("end", () => {
      try {
        const reqBody = JSON.parse(bodyString);
        const reqQuery = url.parse(requestUrl, true).query;
        const reqParams = matchingHandler.matcher(requestUrl).params || {};
        const qReq = new Qreq(reqBody, reqQuery, reqParams);
        const qRes = new Qres(res);
        routeMiddleware(qReq, qRes);
      } catch (err) {
        this.badRequest(res, "Invalid request: malformed JSON");
      }
    });
  }

  listen(port: number) {
    this.server.listen(port, () => {
      console.log(`Qvistdev API is listening on port ${port}`);
    });
  }
}
