"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.defaultErrorHandler = exports.ApiError = void 0;
class ApiError {
    constructor(statusCode, message, data) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data || null;
    }
}
exports.ApiError = ApiError;
const defaultErrorHandler = (context, err) => {
    console.log(err);
    if (err instanceof ApiError) {
        context.res.writeHead(err.statusCode, { "Content-Type": "application/json" });
        const errorResponse = Object.assign({ error: err.message }, (err.data ? { data: err.data } : {}));
        context.res.end(JSON.stringify(errorResponse));
        return;
    }
    context.res.writeHead(500, { "Content-Type": "application/json" });
    context.res.end(JSON.stringify({ error: "Internal server error" }));
    return;
};
exports.defaultErrorHandler = defaultErrorHandler;
exports.createError = {
    generic: (message, statusCode) => new ApiError(statusCode, message),
    badRequest: (message) => new ApiError(400, message),
    unauthorized: (message) => new ApiError(401, message),
    forbidden: (message) => new ApiError(403, message),
    notFound: (message) => new ApiError(404, message),
    methodNotAllowed: (message) => new ApiError(405, message),
    validationError: (message, errors) => new ApiError(400, message, errors),
};
//# sourceMappingURL=errors.js.map