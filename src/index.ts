import http from "http";
import url from "url";
import { Qreq, Qres } from "./features/request";
import { HttpMethod, MiddleWare, RequestHandler } from "./types";

export class Q_API {
  handlers: Array<RequestHandler>;
  server: http.Server;
  errorHandler: (req: Qreq, res: Qres) => void;

  constructor(basePath: string, errorHandler: (req: Qreq, res: Qres) => void) {
    this.handlers = [];
    this.server = http.createServer(this.handleRequest);
    this.errorHandler = errorHandler;
  }

  badRequest(res: http.ServerResponse, message: string) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: message }));
  }

  noRoute(res: http.ServerResponse) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "No matching route" }));
  }

  runNextMiddleware(chain: Array<MiddleWare>, index: number, req: Qreq, res: Qres) {
    const scheduledMiddleware = chain[index];
    index++;
    if (scheduledMiddleware) {
      scheduledMiddleware(req, res, (error) => {
        if (error) {
          this.errorHandler(req, res);
          return;
        }
        this.runNextMiddleware(chain, index, req, res);
      });
    }
  }

  createRouteHandler(chain: Array<MiddleWare>) {
    return (req: Qreq, res: Qres) => {
      let index = 0;
      this.runNextMiddleware(chain, index, req, res);
    };
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

    if (!matchingHandler || !matchingHandler.methods[requestMethod]) {
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
      } catch (err) {
        this.badRequest(res, "Invalid request: malformed JSON");
      }
    });
  }
}
