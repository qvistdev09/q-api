"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authenticator = exports.PemStore = void 0;
const crypto_1 = __importDefault(require("crypto"));
const https_1 = __importDefault(require("https"));
const errors_1 = require("../errors");
class PemStore {
    constructor({ auth0HostName, cacheLimitInMinutes }) {
        this.pem = null;
        this.auth0HostName = auth0HostName;
        this.cacheLimit = cacheLimitInMinutes * 1000 * 60;
        this.fetchedAt = null;
    }
    cacheExpired() {
        if (!this.fetchedAt) {
            return true;
        }
        const cacheAge = new Date().getTime() - this.fetchedAt.getTime();
        return cacheAge > this.cacheLimit;
    }
    shouldRefetch() {
        if (this.cacheExpired() || !this.pem) {
            return true;
        }
        return false;
    }
    getPem() {
        return new Promise((resolve, reject) => {
            if (!this.shouldRefetch() && this.pem) {
                resolve(this.pem);
                return;
            }
            const req = https_1.default.request({ hostname: this.auth0HostName, path: "/PEM", method: "GET" }, (res) => {
                const data = [];
                res.on("data", (chunk) => {
                    data.push(chunk);
                });
                res.on("end", () => {
                    this.pem = Buffer.concat(data).toString();
                    this.fetchedAt = new Date();
                    resolve(this.pem);
                });
                res.on("error", reject);
            });
            req.on("error", reject);
            req.end();
        });
    }
}
exports.PemStore = PemStore;
const authHeaderRegex = /(?<=^Bearer\s).+$/;
class Authenticator {
    constructor(pemStore) {
        this.pemStore = pemStore;
    }
    validateToken(token) {
        return new Promise((resolve, reject) => {
            const [jwtHeader, jwtPayload, jwtSignature] = token.split(".");
            if (!jwtHeader || !jwtPayload || !jwtSignature) {
                reject(errors_1.createError.unauthorized("Malformed JWT token"));
                return;
            }
            const jwtSignatureBase64 = Buffer.from(jwtSignature, "base64url").toString("base64");
            const verifyFn = crypto_1.default.createVerify("RSA-SHA256");
            verifyFn.write(`${jwtHeader}.${jwtPayload}`);
            verifyFn.end();
            this.pemStore
                .getPem()
                .then((pem) => {
                const signatureIsValid = verifyFn.verify(pem, jwtSignatureBase64, "base64");
                if (!signatureIsValid) {
                    reject(errors_1.createError.unauthorized("Invalid JWT token signature"));
                    return;
                }
                try {
                    const user = JSON.parse(Buffer.from(jwtPayload, "base64url").toString("utf-8"));
                    const tokenExpiresAt = new Date(user.exp * 1000);
                    if (tokenExpiresAt.getTime() < new Date().getTime()) {
                        reject(errors_1.createError.unauthorized("Token has expired"));
                        return;
                    }
                    resolve(user);
                }
                catch (err) {
                    reject(errors_1.createError.unauthorized("Invalid token"));
                }
            })
                .catch(reject);
        });
    }
    authenticateRequest(req) {
        return new Promise((resolve, reject) => {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                reject(errors_1.createError.unauthorized("Missing authorization header"));
                return;
            }
            const tokenRegExpMatch = authHeader.match(authHeaderRegex);
            if (!tokenRegExpMatch || !tokenRegExpMatch[0]) {
                reject(errors_1.createError.unauthorized("Missing authorization header"));
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
exports.Authenticator = Authenticator;
//# sourceMappingURL=index.js.map