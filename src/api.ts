import { BaseEndpoint } from "./base-endpoint";
import http from "http";
import { defaultErrorHandler, ErrorHandler } from "./errors";
import { Authenticator, PemStore } from "./auth";
import { importEndpoints } from "./route-init";

export interface Service {
  name: string;
  reference: any;
}

interface AuthConfig {
  auth0HostName: string;
  publicKeyCacheLimitInMinutes?: number;
}

export class Api {
  services: Service[];
  endpoints: BaseEndpoint[];
  server: http.Server;
  errorHandler: ErrorHandler;
  authenticator: Authenticator;
  pemStore: PemStore;

  constructor(authConfig: AuthConfig) {
    this.services = [];
    this.pemStore = new PemStore({
      auth0HostName: authConfig.auth0HostName,
      cacheLimitInMinutes: authConfig.publicKeyCacheLimitInMinutes ?? 30,
    });
    this.authenticator = new Authenticator(this.pemStore);
    this.endpoints = [];
    this.errorHandler = defaultErrorHandler;
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
  }

  addServices(services: Service[]) {
    this.services = services;
    return this;
  }

  importEndpoints(basePath: string) {
    this.endpoints = importEndpoints(basePath, this.services);
    return this;
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {}
}
