import http from "http";

export class Response {
  httpRes: http.ServerResponse;
  locals: any;
  responseData: any;
  statusCode: number | null;

  constructor(httpRes: http.ServerResponse) {
    this.httpRes = httpRes;
    this.statusCode = null;
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
