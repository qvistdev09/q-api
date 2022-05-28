"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaValidation = void 0;
const utils_1 = require("./utils");
class SchemaValidation {
    constructor(schema) {
        this.schema = schema;
        this.propertyValidators = (0, utils_1.getValidatorsRecursively)(schema);
        this.allowedProperties = this.propertyValidators.map((validator) => validator.path);
    }
    validateObject(object, source) {
        const objectKeys = (0, utils_1.indexObjectProperties)(object);
        const validationResult = {
            data: {},
            errors: [],
        };
        objectKeys.forEach((key) => {
            if (!this.allowedProperties.includes(key)) {
                validationResult.errors.push({
                    path: key,
                    issue: "Non-allowed property",
                });
            }
        });
        this.propertyValidators.forEach(({ validator, path }) => {
            const value = (0, utils_1.getValueViaDotNotation)(path, object);
            const propertyValidationResult = validator.validateValue(value, source);
            propertyValidationResult.errors.forEach((errorObj) => {
                validationResult.errors.push({
                    path: errorObj.index !== undefined ? `${path}[${errorObj.index}]` : path,
                    issue: errorObj.issue,
                });
            });
            const { transformedValue, originalValue } = propertyValidationResult;
            const returnValue = transformedValue !== null && transformedValue !== void 0 ? transformedValue : originalValue;
            (0, utils_1.setValueViaDotNotation)(path, validationResult.data, returnValue);
        });
        return validationResult;
    }
}
exports.SchemaValidation = SchemaValidation;
//# sourceMappingURL=schema.js.map