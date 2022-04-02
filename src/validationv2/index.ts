interface ValidationError {
  path: string;
  error: string;
}

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

type Validator = (
  path: string,
  value: any,
  errors: ValidationError[],
  setTransformedValue?: (transformed: any) => void
) => void;

class BaseVal {
  tests: Validator[];
  transformedValue: any;

  constructor() {
    this.tests = [];
    this.transformedValue = null;
  }

  evaluate(objectToValidate: any, returnObject: any, path: string, errors: ValidationError[]) {
    const value = getValueViaDotNotation(path, objectToValidate);
    this.tests.forEach((validator) => {
      validator(path, value, errors, (transformed) => {
        this.transformedValue = transformed;
      });
    });
    setValueViaDotNotation(path, returnObject, this.transformedValue || value);
  }
}

class StringVal extends BaseVal {
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

  enum(accepted: string[]) {
    this.tests.push((path, value, errors) => {
      if (!accepted.includes(value)) {
        errors.push({
          path,
          error: `String must be one of [${accepted.join(" | ")}]`,
        });
      }
    });
  }
}

const integerRegex = /^[1-9][0-9]*$|^0$/;

class NumberVal extends BaseVal {
  constructor() {
    super();
    this.tests.push((path, value, errors) => {
      if (typeof value !== "number") {
        errors.push({
          path,
          error: "Value is not of type number",
        });
      }
    });
  }

  integer({ parseFromString }: { parseFromString: boolean }) {
    this.tests.push((path, value, errors, setTransformedValue) => {
      if (parseFromString) {
        if (typeof value !== "string" || !integerRegex.test(value)) {
          errors.push({
            path,
            error: "String must be parseable as integer",
          });
        } else if (setTransformedValue) {
          setTransformedValue(Number.parseInt(value, 10));
        }
      } else {
        if (!Number.isInteger(value)) {
          errors.push({
            path,
            error: "Value is not of type integer",
          });
        }
      }
    });
    return this;
  }
}

interface Schema {
  [key: string]: BaseVal | Schema;
}

interface ValidatorPairedWithPath {
  validator: BaseVal;
  path: string;
}

export const getValidatorsRecursively = (
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

type ValidatorsMap = Record<string, ValidatorPairedWithPath>;

export const indexObjectProperties = (
  object: any,
  paths: string[] = [],
  properties: string[] = []
) => {
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

class SchemaVal {
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

  validateObject(object: any, requireAllKeys: boolean): { object: any; errors: ValidationError[] } {
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
        validator.validator.evaluate(object, returnObject, validator.path, errors);
      }
    });

    return {
      object: returnObject,
      errors,
    };
  }
}

export const valVersion2 = {
  StringVal,
  NumberVal,
  SchemaVal,
};
