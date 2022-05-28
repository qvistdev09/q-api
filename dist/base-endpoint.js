"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEndpoint = void 0;
const schema_1 = require("./validation/schema");
class BaseEndpoint {
    createMethodHandler(handlerConfig) {
        const schemaValidations = {};
        if (handlerConfig.schemas) {
            const { body, params, query } = handlerConfig.schemas;
            if (body) {
                schemaValidations.body = new schema_1.SchemaValidation(body);
            }
            if (params) {
                schemaValidations.params = new schema_1.SchemaValidation(params);
            }
            if (query) {
                schemaValidations.query = new schema_1.SchemaValidation(query);
            }
        }
        return Object.assign(Object.assign({}, handlerConfig), { schemas: schemaValidations });
    }
}
exports.BaseEndpoint = BaseEndpoint;
//# sourceMappingURL=base-endpoint.js.map