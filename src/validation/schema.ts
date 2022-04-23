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

  constructor(schema: Schema) {
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
          errors: ["Non-allowed property"],
        });
      }
    });
    this.propertyValidators.forEach(({ validator, path }) => {
      const value = getValueViaDotNotation(path, object);
      const propertyValidationResult = validator.validateValue(value, source);
      if (propertyValidationResult.errors.length > 0) {
        validationResult.errors.push({
          path,
          errors: propertyValidationResult.errors,
        });
      }
      const { transformedValue, originalValue } = propertyValidationResult;
      const returnValue = transformedValue !== null ? transformedValue : originalValue;
      setValueViaDotNotation(path, validationResult.data, returnValue);
    });
    return validationResult;
  }
}
