import https from "https";

interface PemConfig {
  auth0HostName: string;
}

class PemStore {
  pem: string | null;
  auth0HostName: string;

  constructor({ auth0HostName }: PemConfig) {
    this.pem = null;
    this.auth0HostName = auth0HostName;
  }

  getPem(): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = https.request(
        { hostname: this.auth0HostName, path: "/PEM", method: "GET" },
        (res) => {
          const data: Array<Uint8Array> = [];
          res.on("data", (chunk) => {
            data.push(chunk);
          });
          res.on("end", () => {
            resolve(Buffer.concat(data).toString());
          });
        }
      );
      req.on("error", reject);
    });
  }
}

const pemStore = new PemStore({ auth0HostName: "qvistdev09.eu.auth0.com" });

pemStore.getPem().then((pem) => {
  console.log(pem);
});
