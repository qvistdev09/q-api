"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.defaultErrorHandler = void 0;
class ApiError {
    constructor(statusCode, message, data) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data || null;
    }
}
const defaultErrorHandler = (req, res, err) => {
    console.log(err);
    if (err instanceof ApiError) {
        res.httpRes.writeHead(err.statusCode, { "Content-Type": "application/json" });
        const errorResponse = Object.assign({ error: err.message }, (err.data ? { data: err.data } : {}));
        res.httpRes.end(JSON.stringify(errorResponse));
        return;
    }
    res.httpRes.writeHead(500, { "Content-Type": "application/json" });
    res.httpRes.end(JSON.stringify({ error: "Internal server error" }));
    return;
};
exports.defaultErrorHandler = defaultErrorHandler;
exports.createError = {
    badRequest: (message) => new ApiError(400, message),
    unauthorized: (message) => new ApiError(401, message),
    forbidden: (message) => new ApiError(403, message),
    notFound: (message) => new ApiError(404, message),
    methodNotAllowed: (message) => new ApiError(405, message),
    validationError: (message, errors) => new ApiError(400, message, errors),
};
//# sourceMappingURL=index.js.map