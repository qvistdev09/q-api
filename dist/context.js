"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthedContext = exports.Context = void 0;
class Context {
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.body = {};
        this.params = {};
        this.query = {};
        this.headers = req.headers;
    }
}
exports.Context = Context;
class AuthedContext extends Context {
    constructor(context, user) {
        super(context.req, context.res);
        this.user = user;
        this.body = context.body;
        this.params = context.params;
        this.query = context.query;
    }
}
exports.AuthedContext = AuthedContext;
//# sourceMappingURL=context.js.map