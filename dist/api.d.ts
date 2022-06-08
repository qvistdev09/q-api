/// <reference types="node" />
import { BaseEndpoint } from "./base-endpoint";
import http from "http";
import { ErrorHandler } from "./errors";
import { Authenticator } from "./auth";
export declare class Api {
    services: Service[];
    endpoints: BaseEndpoint[];
    server: http.Server;
    errorHandler: ErrorHandler;
    authenticator: Authenticator;
    constructor(apiConfig: ApiConfig);
    getHandlerResult(req: http.IncomingMessage, res: http.ServerResponse): Promise<{
        data: any;
        statusCode: number;
    }>;
    handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void;
    listen(port: number): void;
}
export declare const dataSourcesToValidate: readonly ["body", "params", "query"];
declare const supportedMethods: readonly ["GET", "PUT", "POST", "DELETE", "PATCH"];
export declare type HttpMethod = typeof supportedMethods[number];
export interface Service {
    name: string;
    reference: any;
}
export interface AuthConfig {
    auth0HostName: string;
    publicKeyCacheLimitInMinutes?: number;
}
export interface ApiConfig {
    authConfig: AuthConfig;
    basePath: string;
    services: Service[];
}
export {};
