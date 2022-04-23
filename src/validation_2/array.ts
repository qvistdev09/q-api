import { Base } from "./base";
import { ValidationError } from "./types";

export class ArrayValidation<T> extends Base<T> {
  constructor(validator: Base<any>) {
    super();
    this.validatorFunctions.push((path, value, errors) => {
      if (!Array.isArray(value)) {
        errors.push({
          path,
          error: "Value is not an array",
        });
        return;
      }
      value.forEach((element, index) => {
        const data = { data: element };
        const elementErrors: ValidationError[] = [];
        validator.evaluate(data, {}, "data", elementErrors, "body");
        elementErrors.forEach((elementError) => {
          errors.push({
            path: `${path}[${index}]`,
            error: elementError.error,
          });
        });
      });
    });
  }

  minLength(min: number) {
    this.validatorFunctions.push((path, value, errors) => {
      if (Array.isArray(value) && value.length < min) {
        errors.push({
          path,
          error: `Array must have a length that is ${min} minimum`,
        });
      }
    });
    return this;
  }

  maxLength(max: number) {
    this.validatorFunctions.push((path, value, errors) => {
      if (Array.isArray(value) && value.length > max) {
        errors.push({
          path,
          error: `Array must have a length that is ${max} maximum`,
        });
      }
    });
    return this;
  }
}

export const createArrayValidator = <T>(validator: Base<T>) => {
  return new ArrayValidation<Array<typeof validator extends Base<infer TS> ? TS : never>>(
    validator
  );
};
