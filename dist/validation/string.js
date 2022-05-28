"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringValidation = void 0;
const base_1 = require("./base");
class StringValidation extends base_1.BaseValidation {
    constructor() {
        super();
        this.validatorFunctions.push((validationContainer) => {
            if (typeof validationContainer.originalValue !== "string") {
                validationContainer.errors.push({ issue: "Value is not of type string" });
            }
        });
    }
    nullable() {
        const nullableInstance = new StringValidation();
        nullableInstance.validatorFunctions = this.validatorFunctions;
        nullableInstance.isNullable = true;
        return nullableInstance;
    }
    maxLength(limit) {
        this.validatorFunctions.push((validationContainer) => {
            const { originalValue } = validationContainer;
            if (typeof originalValue === "string" && originalValue.length > limit) {
                validationContainer.errors.push({
                    issue: `String cannot be longer than ${limit} characters`,
                });
            }
        });
        return this;
    }
    minLength(minCharacters) {
        this.validatorFunctions.push((validationContainer) => {
            const { originalValue } = validationContainer;
            if (typeof originalValue === "string" && originalValue.length < minCharacters) {
                validationContainer.errors.push({
                    issue: `String must be at least ${minCharacters} characters`,
                });
            }
        });
        return this;
    }
    enum(accepted) {
        this.validatorFunctions.push((validationContainer) => {
            const { originalValue } = validationContainer;
            if (!accepted.includes(originalValue)) {
                validationContainer.errors.push({
                    issue: `String must be one of [${accepted.join(" | ")}]`,
                });
            }
        });
        const typeChangedInstance = new StringValidation();
        typeChangedInstance.validatorFunctions = this.validatorFunctions;
        return typeChangedInstance;
    }
    regex(regex, onError) {
        this.validatorFunctions.push((validationContainer) => {
            if (!regex.test(validationContainer.originalValue)) {
                validationContainer.errors.push({ issue: onError });
            }
        });
        return this;
    }
}
exports.StringValidation = StringValidation;
//# sourceMappingURL=string.js.map