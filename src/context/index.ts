import http from "http";
import { DecodedUser } from "../auth/types";

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
  httpReq: http.IncomingMessage;
  body: object;
  query: object;
  params: object;
  user: DecodedUser | null;

  constructor(httpReq: http.IncomingMessage) {
    this.httpReq = httpReq;
    this.body = {};
    this.query = {};
    this.params = {};
    this.user = null;
  }
}
