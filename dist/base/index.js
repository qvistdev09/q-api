"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = void 0;
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
const utils_1 = require("./utils");
const auth_1 = require("../auth");
const errors_1 = require("../errors");
const context_1 = require("../context");
const routing_1 = require("../routing");
class Api {
    constructor({ basePath, authConfig }) {
        this.pemStore = new auth_1.PemStore({
            auth0HostName: authConfig.auth0HostName,
            cacheLimitInMinutes: authConfig.publicKeyCacheLimitInMinutes || 30,
        });
        this.authenticator = new auth_1.Authenticator(this.pemStore);
        this.endpoints = [];
        this.server = http_1.default.createServer((req, res) => this.forwardRequest(req, res));
        this.errorHandler = errors_1.defaultErrorHandler;
        this.endpoints = (0, utils_1.getEndpointsFromFiles)(basePath);
    }
    parseReqBody(httpReq) {
        return new Promise((resolve, reject) => {
            let bodyString = "";
            httpReq.on("data", (chunk) => {
                bodyString += chunk.toString();
            });
            httpReq.on("error", (error) => {
                reject(error);
            });
            httpReq.on("end", () => {
                try {
                    const parsedReqBody = JSON.parse(bodyString);
                    resolve(parsedReqBody);
                }
                catch (err) {
                    reject(errors_1.createError.badRequest("Malformed JSON"));
                }
            });
        });
    }
    prepareRequest(req, useAuth, requestUrl, matchingEndpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                req.body = (0, utils_1.contentTypeJSON)(req.httpReq) ? yield this.parseReqBody(req.httpReq) : {};
                req.user = useAuth ? yield this.authenticator.authenticateRequest(req.httpReq) : null;
                req.query = url_1.default.parse(requestUrl, true).query;
                req.params = matchingEndpoint.matcher(requestUrl).params || {};
                return;
            }
            catch (err) {
                throw err;
            }
        });
    }
    forwardRequest(httpReq, httpRes) {
        const req = new context_1.Request(httpReq);
        const res = new context_1.Response(httpRes);
        const requestUrl = httpReq.url;
        const requestMethod = httpReq.method ? httpReq.method : null;
        if (!requestUrl || !requestMethod) {
            this.errorHandler(req, res, errors_1.createError.badRequest("Invalid request URL or method"));
            return;
        }
        const matchingEndpoint = this.endpoints.find((endpoint) => endpoint.matcher(requestUrl).match);
        if (!matchingEndpoint) {
            this.errorHandler(req, res, errors_1.createError.notFound("No matching route"));
            return;
        }
        const matchingRoute = matchingEndpoint.methods[requestMethod];
        if (!matchingRoute || !(matchingRoute instanceof routing_1.Route)) {
            this.errorHandler(req, res, errors_1.createError.methodNotAllowed("HTTP method not allowed"));
            return;
        }
        this.prepareRequest(req, matchingRoute.useAuth, requestUrl, matchingEndpoint)
            .then(() => {
            matchingRoute.handleRequest(req, res, this.errorHandler);
        })
            .catch((err) => this.errorHandler(req, res, err));
    }
    listen(port) {
        this.server.listen(port, () => {
            console.log(`Qvistdev API is listening on port ${port}`);
        });
    }
}
exports.Api = Api;
//# sourceMappingURL=index.js.map