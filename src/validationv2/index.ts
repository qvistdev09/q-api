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
