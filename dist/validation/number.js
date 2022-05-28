"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberValidation = void 0;
const base_1 = require("./base");
const regexes_1 = require("./regexes");
class NumberValidation extends base_1.BaseValidation {
    constructor() {
        super();
        this.validatorFunctions.push((validationContainer) => {
            const { originalValue, errors, source } = validationContainer;
            if (source === "body") {
                if (typeof originalValue !== "number") {
                    errors.push({ issue: "Value is not of type number" });
                }
            }
            else {
                if (typeof originalValue !== "string" || !regexes_1.numberRegex.test(originalValue)) {
                    errors.push({ issue: "String must be parseable as number" });
                }
                else {
                    validationContainer.transformedValue = Number.parseFloat(originalValue);
                }
            }
        });
    }
    nullable() {
        const nullableInstance = new NumberValidation();
        nullableInstance.validatorFunctions = this.validatorFunctions;
        nullableInstance.isNullable = true;
        return nullableInstance;
    }
    integer() {
        this.validatorFunctions.push((validationContainer) => {
            const { originalValue, source, errors } = validationContainer;
            if (source === "body") {
                if (!Number.isInteger(originalValue)) {
                    errors.push({ issue: "Value is not integer" });
                }
            }
            else {
                if (typeof originalValue !== "string" || !regexes_1.integerRegex.test(originalValue)) {
                    errors.push({ issue: "Value must be a string that can be parsed to an integer" });
                }
                else {
                    validationContainer.transformedValue = Number.parseInt(originalValue, 10);
                }
            }
        });
        return this;
    }
    max(threshold) {
        this.validatorFunctions.push((validationContainer) => {
            const { originalValue, source, transformedValue, errors } = validationContainer;
            const valueToCheck = source === "body" ? originalValue : transformedValue;
            if (typeof valueToCheck === "number" && valueToCheck > threshold) {
                errors.push({ issue: `Value cannot be greater than ${threshold}` });
            }
        });
        return this;
    }
    min(minimum) {
        this.validatorFunctions.push((validationContainer) => {
            const { originalValue, source, transformedValue, errors } = validationContainer;
            const valueToCheck = source === "body" ? originalValue : transformedValue;
            if (typeof valueToCheck === "number" && valueToCheck < minimum) {
                errors.push({ issue: `Value must be greater than ${minimum}` });
            }
        });
        return this;
    }
}
exports.NumberValidation = NumberValidation;
//# sourceMappingURL=number.js.map