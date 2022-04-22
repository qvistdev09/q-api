import { DataSource, ValidationError, ValidatorFunction } from "./types";
import { getValueViaDotNotation, setValueViaDotNotation } from "./utils";

export class Base<T> {
  _savedType!: T;
  validatorFunctions: ValidatorFunction<T>[];
  transformedValue: T | null;
  isNullable: boolean;

  constructor() {
    this.validatorFunctions = [];
    this.transformedValue = null;
    this.isNullable = false;
  }

  nullable() {
    const nullableVersion = new Base<T | null | undefined>();
    nullableVersion.validatorFunctions = this.validatorFunctions;
    nullableVersion.isNullable = true;
    return nullableVersion;
  }

  evaluate(
    data: any,
    returnedData: any,
    path: string,
    errors: ValidationError[],
    source: DataSource
  ) {
    const value = getValueViaDotNotation(path, data);
    if (this.isNullable && [null, undefined].includes(value)) {
      setValueViaDotNotation(path, returnedData, value);
      return;
    }
    this.validatorFunctions.forEach((validatorFunction) => {
      validatorFunction(path, value, errors, source, (transformed) => {
        this.transformedValue = transformed;
      });
    });
    setValueViaDotNotation(path, returnedData, this.transformedValue || value);
  }
}
