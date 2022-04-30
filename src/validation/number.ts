import { BaseValidation } from "./base";
import { integerRegex, numberRegex } from "./regexes";
import { Nullable } from "./types";

export class NumberValidation<T = number> extends BaseValidation<T> {
  constructor() {
    super();
    this.validatorFunctions.push((validationContainer) => {
      const { originalValue, errors, source } = validationContainer;
      if (source === "body") {
        if (typeof originalValue !== "number") {
          errors.push({ issue: "Value is not of type number" });
        }
      } else {
        if (typeof originalValue !== "string" || !numberRegex.test(originalValue)) {
          errors.push({ issue: "String must be parseable as number" });
        } else {
          validationContainer.transformedValue = Number.parseFloat(originalValue);
        }
      }
    });
  }

  nullable() {
    const nullableInstance = new NumberValidation<Nullable<number>>();
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
      } else {
        if (typeof originalValue !== "string" || !integerRegex.test(originalValue)) {
          errors.push({ issue: "Value must be a string that can be parsed to an integer" });
        } else {
          validationContainer.transformedValue = Number.parseInt(originalValue, 10);
        }
      }
    });
    return this;
  }

  lesserThan(threshold: number) {
    this.validatorFunctions.push((validationContainer) => {
      const { originalValue, source, transformedValue, errors } = validationContainer;
      const valueToCheck = source === "body" ? originalValue : transformedValue;
      if (typeof valueToCheck === "number" && valueToCheck > threshold) {
        errors.push({ issue: `Value cannot be greater than ${threshold}` });
      }
    });
    return this;
  }

  greaterThan(minimum: number) {
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
