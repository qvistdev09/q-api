import { BaseValidation } from "./base";

export class BooleanValidation extends BaseValidation<boolean> {
  constructor() {
    super();
    this.validatorFunctions.push((validationContainer) => {
      const { source, errors, originalValue, transformedValue } = validationContainer;
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
}