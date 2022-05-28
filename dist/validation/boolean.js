"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanValidation = void 0;
const base_1 = require("./base");
class BooleanValidation extends base_1.BaseValidation {
    constructor() {
        super();
        this.validatorFunctions.push((validationContainer) => {
            const { source, errors, originalValue } = validationContainer;
            if (source === "body" && typeof originalValue === "boolean") {
                return;
            }
            if (source === "body" && typeof originalValue !== "boolean") {
                errors.push({ issue: "Value is not boolean" });
                return;
            }
            if (originalValue === "true") {
                validationContainer.transformedValue = true;
                return;
            }
            if (originalValue === "false") {
                validationContainer.transformedValue = false;
                return;
            }
            errors.push({
                issue: "Value must be a string that is parseable as boolean, i.e. 'true' or 'false'",
            });
        });
    }
    nullable() {
        const nullableInstance = new BooleanValidation();
        nullableInstance.validatorFunctions = this.validatorFunctions;
        nullableInstance.isNullable = true;
        return nullableInstance;
    }
}
exports.BooleanValidation = BooleanValidation;
//# sourceMappingURL=boolean.js.map