import https from "https";

interface PemConfig {
  auth0HostName: string;
  cacheLimit: number;
}

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