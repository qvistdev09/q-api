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

export class QString extends QBaseValidator {
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
      if (value.length <= length) {
        return null;
      }
      return {
        property: identifier,
        error: `Length error: string cannot be longer than ${length} characters`,
      };
    });
    return this;
  }

  minLength(length: number) {
    this.tests.push((identifier, value) => {
      if (typeof value !== "string") {
        return null;
      }
      if (value.length >= length) {
        return null;
      }
      return {
        property: identifier,
        error: `Length error: string must be at least ${length} characters`,
      };
    });
    return this;
  }

  enum(acceptedValues: Array<string>) {
    this.tests.push((identifier, value) => {
      if (typeof value !== "string") {
        return null;
      }
      if (acceptedValues.includes(value)) {
        return null;
      }
      return {
        property: identifier,
        error: `Enum error: string must be one of [${acceptedValues.join(" | ")}]`,
      };
    });
    return this;
  }

  regexTest(regex: RegExp, onError: string) {
    this.tests.push((identifier, value) => {
      if (typeof value !== "string") {
        return null;
      }
      if (regex.test(value)) {
        return null;
      }
      return {
        property: identifier,
        error: onError,
      };
    });
    return this;
  }
}
