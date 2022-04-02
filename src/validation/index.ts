import { PairedValidator, PropertyValidator, QSchemaConfig, ValidationError } from "./types";
import { getNestedValue, getValidatorsRecursively, indexObjectProperties } from "./utils";

export class QBaseValidator {
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

export class QNumber extends QBaseValidator {
  constructor() {
    super();
    this.tests.push((identifier, value) => {
      if (typeof value === "number") {
        return null;
      }
      return {
        property: identifier,
        error: "Type error: value is not a number",
      };
    });
  }

  isInteger() {
    this.tests.push((identifier, value) => {
      if (Number.isInteger(value)) {
        return null;
      }
      return {
        property: identifier,
        error: "Value must be integer",
      };
    });
    return this;
  }

  lesserThan(threshold: number) {
    this.tests.push((identifier, value) => {
      if (typeof value !== "number") {
        return null;
      }
      if (value < threshold) {
        return null;
      }
      return {
        property: identifier,
        error: `Number must be lesser than ${threshold}`,
      };
    });
    return this;
  }

  greaterThan(threshold: number) {
    this.tests.push((identifier, value) => {
      if (typeof value !== "number") {
        return null;
      }
      if (value > threshold) {
        return null;
      }
      return {
        property: identifier,
        error: `Number must be greater than ${threshold}`,
      };
    });
    return this;
  }
}

export class QSchema {
  allowedProperties: string[];
  requireAllProperties: boolean;
  validatorMap: Record<string, PairedValidator>;

  constructor({ schema, requireAllProperties }: QSchemaConfig) {
    const validatorMap: Record<string, PairedValidator> = {};
    const pairedValidators = getValidatorsRecursively(schema);
    pairedValidators.forEach((validator) => {
      validatorMap[validator.identifier] = validator;
    });
    this.validatorMap = validatorMap;
    this.allowedProperties = pairedValidators.map((validator) => validator.identifier);
    this.requireAllProperties = requireAllProperties;
  }

  validateObject(object: any) {
    const errors: ValidationError[] = [];
    const objectProperties = indexObjectProperties(object);
    objectProperties.forEach((property) => {
      if (!this.allowedProperties.includes(property)) {
        errors.push({
          property,
          error: "Non-allowed property",
        });
      }
    });
    const propertiesToValidate = this.requireAllProperties
      ? this.allowedProperties
      : objectProperties.filter((property) => this.allowedProperties.includes(property));

    propertiesToValidate.forEach((property) => {
      const validator = this.validatorMap[property];
      if (validator) {
        const errorsOnProperty = validator.validator.testValue(
          property,
          getNestedValue(object, validator.path)
        );
        errors.push(...errorsOnProperty);
      }
    });

    return errors;
  }
}
