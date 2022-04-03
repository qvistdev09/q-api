/// <reference types="node" />
import http from "http";
import { ApiConfig, Endpoint } from "./types";
import { Authenticator, PemStore } from "../auth";
import { ErrorHandler } from "../errors/types";
import { Request } from "../context";
export declare class Api {
    endpoints: Array<Endpoint>;
    server: http.Server;
    errorHandler: ErrorHandler;
    authenticator: Authenticator;
    pemStore: PemStore;
    constructor({ basePath, authConfig }: ApiConfig);
    parseReqBody(httpReq: http.IncomingMessage): Promise<object>;
    prepareRequest(req: Request, useAuth: boolean, requestUrl: string, matchingEndpoint: Endpoint): Promise<void>;
    forwardRequest(httpReq: http.IncomingMessage, httpRes: http.ServerResponse): void;
    listen(port: number): void;
}
