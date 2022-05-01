import { BaseEndpoint } from "./base-endpoint";
import http from "http";
import { defaultErrorHandler, ErrorHandler } from "./errors";
import { Authenticator, PemStore } from "./auth";
import { importEndpoints } from "./route-init";

interface AuthConfig {
  auth0HostName: string;
  publicKeyCacheLimitInMinutes?: number;
}

export interface ApiConfig {
  basePath: string;
  authConfig: AuthConfig;
}

export class Api {
  endpoints: BaseEndpoint[];
  server: http.Server;
  errorHandler: ErrorHandler;
  authenticator: Authenticator;
  pemStore: PemStore;

  constructor({ basePath, authConfig }: ApiConfig) {
    this.pemStore = new PemStore({
      auth0HostName: authConfig.auth0HostName,
      cacheLimitInMinutes: authConfig.publicKeyCacheLimitInMinutes ?? 30,
    });
    this.authenticator = new Authenticator(this.pemStore);
    this.endpoints = importEndpoints(basePath);
    this.errorHandler = defaultErrorHandler;
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {}
}
