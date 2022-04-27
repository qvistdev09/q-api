import { BaseValidation } from "./base";

export class ArrayValidation<T> extends BaseValidation<Array<T>> {
  constructor(validator: BaseValidation<T>) {
    super();
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

  minLength(min: number) {
    this.validatorFunctions.push((validationContainer) => {
      const { originalValue, errors } = validationContainer;
      if (Array.isArray(originalValue) && originalValue.length < min) {
        errors.push({ issue: `Array must have a length that is ${min} minimum` });
      }
    });
    return this;
  }

  maxLength(max: number) {
    this.validatorFunctions.push((validationContainer) => {
      const { originalValue, errors } = validationContainer;
      if (Array.isArray(originalValue) && originalValue.length > max) {
        errors.push({ issue: `Array must have a length that is ${max} maximum` });
      }
    });
    return this;
  }
}
