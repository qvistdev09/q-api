import http from "http";

export class Response {
  httpRes: http.ServerResponse;
  statusCode: number | null;

  constructor(httpRes: http.ServerResponse) {
    this.httpRes = httpRes;
    this.statusCode = null;
  }

  status(statusCode: number) {
    this.statusCode = statusCode;
    return this;
  }

  json(data: object) {
    this.httpRes.writeHead(this.statusCode || 200, { "Content-Type": "application/json" });
    this.httpRes.end(JSON.stringify(data));
  }
}

export class Request {
  body: object;
  query: object;
  params: object;

  constructor(body: object, query?: object | null, params?: object | null) {
    this.body = body;
    this.query = query || {};
    this.params = params || {};
  }
}
