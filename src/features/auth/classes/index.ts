import { DecodedUser, PemConfig } from "../types";
import crypto from "crypto";
import https from "https";
import http from "http";

export class PemStore {
  private pem: string | null;
  private auth0HostName: string;
  private cacheLimit: number;
  private fetchedAt: Date | null;

  constructor({ auth0HostName, cacheLimitInMinutes }: PemConfig) {
    this.pem = null;
    this.auth0HostName = auth0HostName;
    this.cacheLimit = cacheLimitInMinutes * 1000 * 60;
    this.fetchedAt = null;
  }

  private cacheExpired(): Boolean {
    if (!this.fetchedAt) {
      return true;
    }
    const cacheAge = new Date().getTime() - this.fetchedAt.getTime();
    return cacheAge > this.cacheLimit;
  }

  private shouldRefetch(): Boolean {
    if (this.cacheExpired() || !this.pem) {
      return true;
    }
    return false;
  }

  getPem(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.shouldRefetch() && this.pem) {
        resolve(this.pem);
        return;
      }
      const req = https.request(
        { hostname: this.auth0HostName, path: "/PEM", method: "GET" },
        (res) => {
          const data: Array<Uint8Array> = [];
          res.on("data", (chunk) => {
            data.push(chunk);
          });
          res.on("end", () => {
            this.pem = Buffer.concat(data).toString();
            this.fetchedAt = new Date();
            resolve(this.pem);
          });
          res.on("error", reject);
        }
      );
      req.on("error", reject);
      req.end();
    });
  }
}

const authHeaderRegex = /(?<=^Bearer\s).+$/;

export class Authenticator {
  private pemStore: PemStore;
  constructor(pemStore: PemStore) {
    this.pemStore = pemStore;
  }

  validateToken(token: string): Promise<DecodedUser> {
    return new Promise((resolve, reject) => {
      const [jwtHeader, jwtPayload, jwtSignature] = token.split(".");
      if (!jwtHeader || !jwtPayload || !jwtSignature) {
        reject(new Error("Malformed token"));
        return;
      }
      const jwtSignatureBase64 = Buffer.from(jwtSignature, "base64url").toString("base64");
      const verifyFn = crypto.createVerify("RSA-SHA256");
      verifyFn.write(`${jwtHeader}.${jwtPayload}`);
      verifyFn.end();
      this.pemStore
        .getPem()
        .then((pem) => {
          const signatureIsValid = verifyFn.verify(pem, jwtSignatureBase64, "base64");
          if (!signatureIsValid) {
            reject(new Error("Invalid signature"));
            return;
          }
          try {
            const user = JSON.parse(Buffer.from(jwtPayload, "base64url").toString("utf-8"));
            resolve(user as DecodedUser);
          } catch (err) {
            reject(err);
          }
        })
        .catch(reject);
    });
  }

  authenticateRequest(req: http.IncomingMessage): Promise<DecodedUser> {
    return new Promise((resolve, reject) => {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        reject();
        return;
      }
      const tokenRegExpMatch = authHeader.match(authHeaderRegex);
      if (!tokenRegExpMatch || !tokenRegExpMatch[0]) {
        reject();
        return;
      }
      const token = tokenRegExpMatch[0];
      this.validateToken(token)
        .then((user) => {
          resolve(user);
        })
        .catch(reject);
    });
  }
}
