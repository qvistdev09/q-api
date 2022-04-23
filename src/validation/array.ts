import { BaseValidation } from "./base";

export class ArrayValidation<T> extends BaseValidation<T> {
  constructor(validator: BaseValidation<any>) {
    super();
    this.validatorFunctions.push((validationContainer) => {
      const { originalValue, errors, source } = validationContainer;
      if (!Array.isArray(originalValue)) {
        errors.push("Value is not an array");
        return;
      }
      originalValue.forEach((element, index) => {
        const elementValidationResult = validator.validateValue(element, source);
        elementValidationResult.errors = elementValidationResult.errors.map(
          (errorMessage) => `[${index}] ${errorMessage}`
        );
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
        errors.push(`Array must have a length that is ${min} minimum`);
      }
    });
    return this;
  }

  maxLength(max: number) {
    this.validatorFunctions.push((validationContainer) => {
      const { originalValue, errors } = validationContainer;
      if (Array.isArray(originalValue) && originalValue.length > max) {
        errors.push(`Array must have a length that is ${max} maximum`);
      }
    });
    return this;
  }
}

export const createArrayValidator = <T>(validator: BaseValidation<T>) => {
  return new ArrayValidation<Array<typeof validator extends BaseValidation<infer TS> ? TS : never>>(
    validator
  );
};
