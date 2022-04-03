/// <reference types="node" />
import http from "http";
import { DecodedUser } from "../auth/types";
export declare class Response {
    httpRes: http.ServerResponse;
    locals: any;
    responseData: any;
    statusCode: number | null;
    constructor(httpRes: http.ServerResponse);
}
export declare class Request {
    httpReq: http.IncomingMessage;
    body: object;
    query: object;
    params: object;
    user: DecodedUser | null;
    constructor(httpReq: http.IncomingMessage);
}
