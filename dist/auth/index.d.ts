/// <reference types="node" />
import { DecodedUser, PemConfig } from "./types";
import http from "http";
export declare class PemStore {
    private pem;
    private auth0HostName;
    private cacheLimit;
    private fetchedAt;
    constructor({ auth0HostName, cacheLimitInMinutes }: PemConfig);
    private cacheExpired;
    private shouldRefetch;
    getPem(): Promise<string>;
}
export declare class Authenticator {
    private pemStore;
    constructor(pemStore: PemStore);
    validateToken(token: string): Promise<DecodedUser>;
    authenticateRequest(req: http.IncomingMessage): Promise<DecodedUser>;
}
