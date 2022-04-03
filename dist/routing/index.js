"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const utils_1 = require("./utils");
const errors_1 = require("../errors");
class Route {
    constructor({ middlewares, useAuth }) {
        (0, utils_1.assertRequiredDependencies)(middlewares);
        this.useAuth = useAuth;
        this.segments = (0, utils_1.segmentDependencies)(middlewares);
        this.reqBodySchema = null;
        this.querySchema = null;
        this.paramsSchema = null;
        this.reqBodyRequireAllProperties = true;
        this.queryRequireAllProperties = true;
    }
    addRequestBodyValidation(schema, requireAllProperties) {
        this.reqBodySchema = schema;
        this.reqBodyRequireAllProperties = requireAllProperties;
        return this;
    }
    addQueryValidationSchema(schema, requireAllProperties) {
        this.querySchema = schema;
        this.queryRequireAllProperties = requireAllProperties;
        return this;
    }
    addParamsValidationSchema(schema) {
        this.paramsSchema = schema;
        return this;
    }
    runNextMiddleware(index, req, res, errorHandler) {
        const scheduledSegment = this.segments[index];
        index++;
        if (scheduledSegment) {
            Promise.all(scheduledSegment.map((middlewareFunction) => middlewareFunction(req, res)))
                .then(() => {
                this.runNextMiddleware(index, req, res, errorHandler);
            })
                .catch((err) => {
                errorHandler(req, res, err);
            });
            return;
        }
        if (res.responseData && res.statusCode) {
            res.httpRes.writeHead(res.statusCode, { "Content-Type": "application/json" });
            res.httpRes.end(JSON.stringify(res.responseData));
            return;
        }
        errorHandler(req, res, new Error("Route has no set response"));
    }
    handleRequest(req, res, errorHandler) {
        if (this.reqBodySchema) {
            const { errors, object } = this.reqBodySchema.validateObject(req.body, this.reqBodyRequireAllProperties, "body");
            if (errors.length > 0) {
                errorHandler(req, res, errors_1.createError.validationError("Invalid request body", errors));
                return;
            }
            else {
                req.body = object;
            }
        }
        if (this.querySchema) {
            const { errors, object } = this.querySchema.validateObject(req.query, this.queryRequireAllProperties, "query");
            if (errors.length > 0) {
                errorHandler(req, res, errors_1.createError.validationError("Invalid query", errors));
                return;
            }
            else {
                req.query = object;
            }
        }
        if (this.paramsSchema) {
            const { errors, object } = this.paramsSchema.validateObject(req.params, true, "path");
            if (errors.length > 0) {
                errorHandler(req, res, errors_1.createError.validationError("Invalid params", errors));
                return;
            }
            else {
                req.params = object;
            }
        }
        let index = 0;
        this.runNextMiddleware(index, req, res, errorHandler);
    }
}
exports.Route = Route;
//# sourceMappingURL=index.js.map