"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = exports.Response = void 0;
class Response {
    constructor(httpRes) {
        this.httpRes = httpRes;
        this.statusCode = null;
    }
}
exports.Response = Response;
class Request {
    constructor(httpReq) {
        this.httpReq = httpReq;
        this.body = {};
        this.query = {};
        this.params = {};
        this.user = null;
    }
}
exports.Request = Request;
//# sourceMappingURL=index.js.map