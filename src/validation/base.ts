import { DataSource, ValidationResult, ValidatorFunction } from "./types";

export class BaseValidation<GoalType> {
  _savedGoalType!: GoalType;
  transformedValue: any;
  validatorFunctions: ValidatorFunction[];
  isNullable: boolean;

  constructor() {
    this.validatorFunctions = [];
    this.transformedValue = null;
    this.isNullable = false;
  }

  nullable() {
    const nullableInstance = new BaseValidation<GoalType | null | undefined>();
    nullableInstance.validatorFunctions = this.validatorFunctions;
    nullableInstance.isNullable = true;
    return nullableInstance;
  }

  validateValue(value: any, dataSource: DataSource): ValidationResult {
    const errorMessages: string[] = [];
    this.validatorFunctions.forEach((validator) => {
      const output = validator(value, dataSource);
      if (output.result === "fail") {
        errorMessages.push(output.errorMessage);
      } else if (output.transformedValue !== undefined) {
        this.transformedValue = output.transformedValue;
      }
    });
    const valueToReturn = this.transformedValue !== null ? this.transformedValue : value;
    return {
      errorMessages,
      value: valueToReturn,
    };
  }
}
