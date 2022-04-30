import { DataSource, ValidationContainer, ValidatorFunction } from "./types";

export class BaseValidation<GoalType> {
  _savedGoalType!: GoalType;
  validatorFunctions: ValidatorFunction[];
  isNullable: boolean;

  constructor() {
    this.validatorFunctions = [];
    this.isNullable = false;
  }

  validateValue(value: any, dataSource: DataSource): ValidationContainer {
    const validationContainer: ValidationContainer = {
      errors: [],
      originalValue: value,
      transformedValue: null,
      source: dataSource,
    };
    if (this.isNullable && [undefined, null].includes(value)) {
      return validationContainer;
    }
    this.validatorFunctions.forEach((validatorFunction) => validatorFunction(validationContainer));
    return validationContainer;
  }
}
