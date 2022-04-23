import { DataSource, ValidationError, ValidatorFunction } from "./types";
import { getValueViaDotNotation, setValueViaDotNotation } from "./utils";

export class Base<T> {
  _savedType!: T;
  transformedValue: any;
  validatorFunctions: ValidatorFunction[];
  isNullable: boolean;

  constructor() {
    this.transformedValue = null;
    this.validatorFunctions = [];
    this.isNullable = false;
  }

  nullable() {
    const nullableInstance = new Base<T | null | undefined>();
    nullableInstance.validatorFunctions = this.validatorFunctions;
    nullableInstance.isNullable = true;
    return nullableInstance;
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
    this.validatorFunctions.forEach((validationFunction) => {
      validationFunction(path, value, errors, source, (transformedValue) => {
        this.transformedValue = transformedValue;
      });
    });
    const returnValue = this.transformedValue !== null ? this.transformedValue : value;
    setValueViaDotNotation(path, returnedData, returnValue);
  }
}
