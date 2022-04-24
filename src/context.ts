import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import { DecodedUser } from "./auth/types";
import { JSON } from "./types";

export class Context {
  httpRes: ServerResponse;
  httpReq: IncomingMessage;
  body: any;
  query: any;
  params: any;
  headers: IncomingHttpHeaders;
  user?: DecodedUser;
  responseData: JSON;
  statusCode: number | null;

  constructor(httpReq: IncomingMessage, httpRes: ServerResponse) {
    this.httpReq = httpReq;
    this.httpRes = httpRes;
    this.responseData = {};
    this.statusCode = null;
    this.headers = httpReq.headers;
  }
}
