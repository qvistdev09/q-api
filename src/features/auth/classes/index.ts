import { DecodedUser, PemConfig } from "../types";
import crypto from "crypto";
import https from "https";

export class PemStore {
  private pem: string | null;
  private auth0HostName: string;
  private cacheLimit: number;
  private fetchedAt: Date | null;

  constructor({ auth0HostName, cacheLimit }: PemConfig) {
    this.pem = null;
    this.auth0HostName = auth0HostName;
    this.cacheLimit = cacheLimit;
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

export class Authenticator {
  private pemStore: PemStore;
  constructor(pemStore: PemStore) {
    this.pemStore = pemStore;
  }

  authenticateUser(token: string): Promise<DecodedUser> {
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
}
