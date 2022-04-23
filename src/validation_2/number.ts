import { Base } from "./base";
import { integerRegex, numberRegex } from "./regexes";

export class NumberValidation extends Base<number> {
  constructor() {
    super();
    this.validatorFunctions.push((path, value, errors, dataSource, setTransformedValue) => {
      if (dataSource === "body") {
        if (typeof value !== "number") {
          errors.push({
            path,
            error: "Value is not of type number",
          });
        }
      } else {
        if (typeof value !== "string" || !numberRegex.test(value)) {
          errors.push({
            path,
            error: "String must be parseable as number",
          });
        } else {
          setTransformedValue(Number.parseFloat(value));
        }
      }
    });
  }

  integer() {
    this.validatorFunctions.push((path, value, errors, dataSource, setTransformedValue) => {
      if (dataSource === "body") {
        if (!Number.isInteger(value)) {
          errors.push({
            path,
            error: "Value is not integer",
          });
        }
      } else {
        if (typeof value !== "string" || !integerRegex.test(value)) {
          errors.push({
            path,
            error: "Value must be a string that can be parsed to an integer",
          });
        } else {
          setTransformedValue(Number.parseInt(value, 10));
        }
      }
    });
    return this;
  }

  lesserThan(threshold: number) {
    this.validatorFunctions.push((path, value, errors, dataSource) => {
      const valueToCheck = dataSource === "body" ? value : this.transformedValue;
      if (typeof valueToCheck === "number" && valueToCheck >= threshold) {
        errors.push({
          path,
          error: `Value cannot be greater than ${threshold}`,
        });
      }
    });
    return this;
  }

  greaterThan(minimum: number) {
    this.validatorFunctions.push((path, value, errors, dataSource) => {
      const valueToCheck = dataSource === "body" ? value : this.transformedValue;
      if (typeof valueToCheck === "number" && valueToCheck <= minimum) {
        errors.push({
          path,
          error: `Value must be greater than ${minimum}`,
        });
      }
    });
    return this;
  }
}
