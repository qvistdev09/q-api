import {
  ValidationError,
  DataSource,
  Validator,
  Schema,
  ValidatorPairedWithPath,
  ValidatorsMap,
} from "./types";

const isObject = (value: any) => {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
};

const getValueViaDotNotation = (path: string, data: any): any => {
  return path.split(".").reduce((object: any, accessor: string) => {
    if (object === undefined || object === null) {
      return null;
    }
    return object[accessor];
  }, data);
};

const setValueViaDotNotation = (path: string, data: any, value: any) => {
  let currentLevel = data;
  path.split(".").forEach((accessor: string, index, array) => {
    if (index === array.length - 1) {
      currentLevel[accessor] = value;
    } else {
      if (isObject(currentLevel[accessor])) {
        currentLevel = currentLevel[accessor];
      } else {
        currentLevel[accessor] = {};
        currentLevel = currentLevel[accessor];
      }
    }
  });
};

export class BaseVal {
  tests: Validator[];
  transformedValue: any;

  constructor() {
    this.tests = [];
    this.transformedValue = null;
  }

  evaluate(
    objectToValidate: any,
    returnObject: any,
    path: string,
    errors: ValidationError[],
    source: DataSource
  ) {
    const value = getValueViaDotNotation(path, objectToValidate);
    this.tests.forEach((validator) => {
      validator(path, value, errors, source, (transformed) => {
        this.transformedValue = transformed;
      });
    });
    setValueViaDotNotation(path, returnObject, this.transformedValue || value);
  }
}

export class StringVal extends BaseVal {
  constructor() {
    super();
    this.tests.push((path, value, errors) => {
      if (typeof value !== "string") {
        errors.push({
          path,
          error: "Value is not of type string",
        });
      }
    });
  }

  maxLength(limit: number) {
    this.tests.push((path, value, errors) => {
      if (typeof value === "string" && value.length > limit) {
        errors.push({
          path,
          error: `String cannot be longer than ${limit} characters`,
        });
      }
    });
    return this;
  }

  minLength(minCharacters: number) {
    this.tests.push((path, value, errors) => {
      if (typeof value === "string" && value.length < minCharacters) {
        errors.push({
          path,
          error: `String must be at least ${minCharacters} characters`,
        });
      }
    });
    return this;
  }

  enum(accepted: string[]) {
    this.tests.push((path, value, errors) => {
      if (!accepted.includes(value)) {
        errors.push({
          path,
          error: `String must be one of [${accepted.join(" | ")}]`,
        });
      }
    });
    return this;
  }

  regex(regex: RegExp, onError: string) {
    this.tests.push((path, value, errors) => {
      if (!regex.test(value)) {
        errors.push({
          path,
          error: onError,
        });
      }
    });
    return this;
  }
}

const integerRegex = /^[1-9][0-9]*$|^0$/;
const numberRegex = /(^[1-9][0-9]*$|^0$)|(^(0|[1-9][0-9]*)\.\d+$)/;

export class NumberVal extends BaseVal {
  constructor() {
    super();
    this.tests.push((path, value, errors, source, setTransformedValue) => {
      if (source === "body") {
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
    this.tests.push((path, value, errors, source, setTransformedValue) => {
      if (source === "body") {
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
    this.tests.push((path, value, errors, source) => {
      const valueToCheck = source === "body" ? value : this.transformedValue;
      if (typeof valueToCheck === "number" && valueToCheck > threshold) {
        errors.push({
          path,
          error: `Value cannot be greater than ${threshold}`,
        });
      }
    });
    return this;
  }

  greaterThan(minimum: number) {
    this.tests.push((path, value, errors, source) => {
      const valueToCheck = source === "body" ? value : this.transformedValue;
      if (typeof valueToCheck === "number" && valueToCheck < minimum) {
        errors.push({
          path,
          error: `Value must be greater than ${minimum}`,
        });
      }
    });
    return this;
  }
}

const getValidatorsRecursively = (
  schema: Schema,
  paths: string[] = [],
  validators: ValidatorPairedWithPath[] = []
) => {
  const keys = Object.keys(schema);
  keys.forEach((key) => {
    const nextValue = schema[key];
    if (nextValue instanceof BaseVal) {
      validators.push({
        path: [...paths, key].join("."),
        validator: nextValue,
      });
    } else {
      const nextLevel = schema[key];
      if (nextLevel && !(nextLevel instanceof BaseVal)) {
        paths.push(key);
        getValidatorsRecursively(nextLevel, paths, validators);
      }
    }
  });
  return validators;
};

const indexObjectProperties = (object: any, paths: string[] = [], properties: string[] = []) => {
  if (!isObject(object)) {
    return properties;
  }
  Object.keys(object).forEach((key) => {
    const nextValue = object[key];
    if (!isObject(nextValue)) {
      properties.push([...paths, key].join("."));
    } else {
      paths.push(key);
      indexObjectProperties(object[key], paths, properties);
    }
  });
  return properties;
};

export class SchemaVal {
  allowedProperties: string[];
  validatorsMap: ValidatorsMap;

  constructor(schema: Schema) {
    const validatorsMap: ValidatorsMap = {};
    const pairedValidators = getValidatorsRecursively(schema);
    pairedValidators.forEach((pairedValidator) => {
      validatorsMap[pairedValidator.path] = pairedValidator;
    });
    this.validatorsMap = validatorsMap;
    this.allowedProperties = pairedValidators.map((pairedValidator) => pairedValidator.path);
  }

  validateObject(
    object: any,
    requireAllKeys: boolean,
    source: DataSource
  ): { object: any; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const returnObject = {};
    const objectProperties = indexObjectProperties(object);
    objectProperties.forEach((property) => {
      if (!this.allowedProperties.includes(property)) {
        errors.push({
          path: property,
          error: "Non-allowed property",
        });
      }
    });

    const propertiesToValidate = requireAllKeys
      ? this.allowedProperties
      : objectProperties.filter((property) => this.allowedProperties.includes(property));

    propertiesToValidate.forEach((property) => {
      const validator = this.validatorsMap[property];
      if (validator) {
        validator.validator.evaluate(object, returnObject, validator.path, errors, source);
      }
    });

    return {
      object: returnObject,
      errors,
    };
  }
}
