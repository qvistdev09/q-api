import { DecodedUser } from "../../types";
import { PemStore } from "../pem-store";
import crypto from "crypto";

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
