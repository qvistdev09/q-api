import { DataSource, ObjectValidationResult, PairedValidator, Schema } from "./types";
import {
  getValidatorsRecursively,
  getValueViaDotNotation,
  indexObjectProperties,
  setValueViaDotNotation,
} from "./utils";

export class SchemaValidation {
  propertyValidators: PairedValidator[];
  allowedProperties: string[];
  schema: Schema;

  constructor(schema: Schema) {
    this.schema = schema;
    this.propertyValidators = getValidatorsRecursively(schema);
    this.allowedProperties = this.propertyValidators.map((validator) => validator.path);
  }

  validateObject(object: any, source: DataSource): ObjectValidationResult {
    const objectKeys = indexObjectProperties(object);
    const validationResult: ObjectValidationResult = {
      data: {},
      errors: [],
    };
    objectKeys.forEach((key) => {
      if (!this.allowedProperties.includes(key)) {
        validationResult.errors.push({
          path: key,
          issue: "Non-allowed property",
        });
      }
    });
    this.propertyValidators.forEach(({ validator, path }) => {
      const value = getValueViaDotNotation(path, object);
      const propertyValidationResult = validator.validateValue(value, source);
      propertyValidationResult.errors.forEach((errorObj) => {
        validationResult.errors.push({
          path: errorObj.index !== undefined ? `${path}[${errorObj.index}]` : path,
          issue: errorObj.issue,
        });
      });
      const { transformedValue, originalValue } = propertyValidationResult;
      const returnValue = transformedValue ?? originalValue;
      setValueViaDotNotation(path, validationResult.data, returnValue);
    });
    return validationResult;
  }
}
