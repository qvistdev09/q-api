/// <reference types="node" />
import http from "http";
export interface PemConfig {
    auth0HostName: string;
    cacheLimitInMinutes: number;
}
export interface DecodedUser {
    iss: string;
    sub: string;
    aud: Array<string>;
    iat: number;
    exp: number;
    azp: string;
    scope: string;
}
export declare class PemStore {
    private pem;
    private auth0HostName;
    private cacheLimit;
    private fetchedAt;
    constructor({ auth0HostName, cacheLimitInMinutes }: PemConfig);
    private cacheIsExpired;
    private shouldRefetch;
    getPem(): Promise<string>;
}
export declare class Authenticator {
    private pemStore;
    constructor(pemStore: PemStore);
    validateToken(token: string): Promise<DecodedUser>;
    authenticateRequest(req: http.IncomingMessage): Promise<DecodedUser>;
}
