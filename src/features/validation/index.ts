import { PropertyValidator, ValidationError } from "../../types";

class QBaseValidator {
  tests: Array<PropertyValidator>;
  constructor() {
    this.tests = [];
  }

  testValue(identifier: string, value: any) {
    return this.tests
      .map((validator) => validator(identifier, value))
      .filter((result): result is ValidationError => result !== null);
  }
}

class QString extends QBaseValidator {
  constructor() {
    super();
    this.tests.push((identifier: string, value: any) => {
      if (typeof value === "string") {
        return null;
      }
      return {
        property: identifier,
        error: "Type error: value is not a string.",
      };
    });
  }

  maxLength(length: number) {
    this.tests.push((identifier: string, value: any) => {
      if (typeof value !== "string") {
        return null;
      }
      if (value.length > length) {
        return {
          property: identifier,
          error: `Length error: string cannot be longer than ${length} characters`,
        };
      }
      return null;
    });
    return this;
  }
}
