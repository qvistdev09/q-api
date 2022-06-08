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
exports.dataSourcesToValidate = exports.Api = void 0;
const http_1 = __importDefault(require("http"));
const url_1 = require("url");
const errors_1 = require("./errors");
const auth_1 = require("./auth");
const route_init_1 = require("./route-init");
const context_1 = require("./context");
class Api {
    constructor(apiConfig) {
        var _a;
        this.services = apiConfig.services;
        this.endpoints = (0, route_init_1.importEndpoints)(apiConfig.basePath, this.services);
        this.authenticator = new auth_1.Authenticator(new auth_1.PemStore({
            auth0HostName: apiConfig.authConfig.auth0HostName,
            cacheLimitInMinutes: (_a = apiConfig.authConfig.publicKeyCacheLimitInMinutes) !== null && _a !== void 0 ? _a : 30,
        }));
        this.errorHandler = errors_1.defaultErrorHandler;
        this.server = http_1.default.createServer((req, res) => this.handleRequest(req, res));
    }
    getHandlerResult(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let context = new context_1.Context(req, res);
            try {
                context.body = yield parseRequestBody(req);
                context.query = getQueryObjectFromUrl(req.url);
                const endpointMatch = getMatchingEndpoint(req, this.endpoints);
                context.params = endpointMatch.params;
                const { methodHandler, method } = getMethodHandlerOnEndpoint(req, endpointMatch.endpoint);
                if (methodHandler.useAuth) {
                    context = new context_1.AuthedContext(context, yield this.authenticator.authenticateRequest(req));
                }
                performValidations(methodHandler, context);
                const handlerData = yield methodHandler.handlerFunction(context);
                return {
                    data: handlerData,
                    statusCode: getStatusCode(method, handlerData),
                };
            }
            catch (error) {
                throw new ContextBoundError(context, error);
            }
        });
    }
    handleRequest(req, res) {
        this.getHandlerResult(req, res)
            .then(({ data, statusCode }) => {
            if (data !== undefined) {
                jsonRespond(res, data, statusCode);
            }
            else {
                statusCodeRespond(res, statusCode);
            }
        })
            .catch((error) => {
            if (error instanceof ContextBoundError) {
                this.errorHandler(error.context, error.error);
            }
            else {
                this.errorHandler(new context_1.Context(req, res), error);
            }
        });
    }
    listen(port) {
        this.server.listen(port, () => {
            console.log(`API is listening on port ${port}`);
        });
    }
}
exports.Api = Api;
exports.dataSourcesToValidate = ["body", "params", "query"];
function performValidations(methodHandler, context) {
    exports.dataSourcesToValidate.forEach((source) => {
        const validationSchema = methodHandler.schemas[source];
        if (validationSchema) {
            const data = context[source];
            const validationResult = validationSchema.validateObject(data, source);
            if (validationResult.errors.length > 0) {
                throw errors_1.createError.validationError(`Request validation error in: ${source}`, validationResult.errors);
            }
        }
    });
}
const supportedMethods = ["GET", "PUT", "POST", "DELETE", "PATCH"];
function validRequestMethod(method) {
    return supportedMethods.includes(method);
}
function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        if (!requestContentTypeIsJSON(req)) {
            return resolve({});
        }
        const data = [];
        req.on("data", (chunk) => data.push(chunk));
        req.on("end", () => {
            try {
                const parsedRequestBody = JSON.parse(Buffer.concat(data).toString());
                resolve(parsedRequestBody);
            }
            catch (error) {
                reject(error);
            }
        });
        req.on("error", (error) => reject(error));
    });
}
function getQueryObjectFromUrl(url) {
    if (!url) {
        return {};
    }
    try {
        const urlObject = new url_1.URL(url);
        const query = {};
        urlObject.searchParams.forEach((value, name) => {
            query[name] = value;
        });
        return query;
    }
    catch (err) {
        return {};
    }
}
function jsonRespond(res, data, statusCode) {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}
function statusCodeRespond(res, statusCode) {
    res.writeHead(statusCode).end();
}
function requestContentTypeIsJSON(httpReq) {
    if (httpReq.headers["content-type"] &&
        httpReq.headers["content-type"].toLowerCase() === "application/json") {
        return true;
    }
    return false;
}
function findEndpoint(url, endpoints) {
    var _a, _b;
    const cleanedUrl = url.replace(/\/*$/, "");
    for (let endpoint of endpoints) {
        const matchResult = (_a = endpoint.urlMatcher) === null || _a === void 0 ? void 0 : _a.call(endpoint, cleanedUrl);
        if (matchResult && matchResult.match) {
            return {
                endpoint,
                params: (_b = matchResult.params) !== null && _b !== void 0 ? _b : {},
            };
        }
    }
    return null;
}
function getMatchingEndpoint(req, endpoints) {
    const { url } = req;
    if (typeof url !== "string") {
        throw errors_1.createError.badRequest("Invalid request URL");
    }
    const endpointMatch = findEndpoint(url, endpoints);
    if (endpointMatch === null) {
        throw errors_1.createError.notFound("No matching endpoint");
    }
    return endpointMatch;
}
function getMethodHandlerOnEndpoint(req, endpoint) {
    const { method } = req;
    if (!validRequestMethod(method)) {
        throw errors_1.createError.badRequest("Invalid request method");
    }
    const methodHandler = endpoint[method];
    if (!methodHandler) {
        throw errors_1.createError.methodNotAllowed("Method not allowed on this endpoint");
    }
    return { methodHandler, method };
}
const statusCodes = {
    data: {
        GET: 200,
        PUT: 200,
        POST: 201,
        DELETE: 200,
        PATCH: 200,
    },
    noData: {
        GET: 204,
        PUT: 204,
        POST: 204,
        DELETE: 204,
        PATCH: 204,
    },
};
function getStatusCode(method, data) {
    if (data !== undefined) {
        return statusCodes.data[method];
    }
    return statusCodes.noData[method];
}
class ContextBoundError {
    constructor(context, error) {
        this.context = context;
        this.error = error;
    }
}
//# sourceMappingURL=api.js.map