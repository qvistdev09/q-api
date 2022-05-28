"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayValidation = void 0;
const base_1 = require("./base");
class ArrayValidation extends base_1.BaseValidation {
    constructor(validator) {
        super();
        this.validator = validator;
        this.validatorFunctions.push((validationContainer) => {
            const { originalValue, errors, source } = validationContainer;
            if (!Array.isArray(originalValue)) {
                errors.push({ issue: "Value is not an array" });
                return;
            }
            originalValue.forEach((element, index) => {
                const elementValidationResult = validator.validateValue(element, source);
                elementValidationResult.errors = elementValidationResult.errors.map((errorObject) => ({
                    issue: errorObject.issue,
                    index,
                }));
                validationContainer.errors = [
                    ...validationContainer.errors,
                    ...elementValidationResult.errors,
                ];
            });
        });
    }
    nullable() {
        const nullableInstance = new ArrayValidation(this.validator);
        nullableInstance.validatorFunctions = this.validatorFunctions;
        nullableInstance.isNullable = true;
        return nullableInstance;
    }
    minLength(min) {
        this.validatorFunctions.push((validationContainer) => {
            const { originalValue, errors } = validationContainer;
            if (Array.isArray(originalValue) && originalValue.length < min) {
                errors.push({ issue: `Array must have a length that is ${min} minimum` });
            }
        });
        return this;
    }
    maxLength(max) {
        this.validatorFunctions.push((validationContainer) => {
            const { originalValue, errors } = validationContainer;
            if (Array.isArray(originalValue) && originalValue.length > max) {
                errors.push({ issue: `Array must have a length that is ${max} maximum` });
            }
        });
        return this;
    }
}
exports.ArrayValidation = ArrayValidation;
//# sourceMappingURL=array.js.map