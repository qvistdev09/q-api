"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseValidation = void 0;
class BaseValidation {
    constructor() {
        this.validatorFunctions = [];
        this.isNullable = false;
    }
    validateValue(value, dataSource) {
        const validationContainer = {
            errors: [],
            originalValue: value,
            transformedValue: null,
            source: dataSource,
        };
        if (this.isNullable && [undefined, null].includes(value)) {
            return validationContainer;
        }
        this.validatorFunctions.forEach((validatorFunction) => validatorFunction(validationContainer));
        return validationContainer;
    }
}
exports.BaseValidation = BaseValidation;
//# sourceMappingURL=base.js.map