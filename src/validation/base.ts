import { DataSource, ValidationContainer, ValidatorFunction } from "./types";

export class BaseValidation<GoalType> {
  _savedGoalType!: GoalType;
  validatorFunctions: ValidatorFunction[];
  isNullable: boolean;

  constructor() {
    this.validatorFunctions = [];
    this.isNullable = false;
  }

  nullable() {
    const nullableInstance = new BaseValidation<GoalType | null | undefined>();
    nullableInstance.validatorFunctions = this.validatorFunctions;
    nullableInstance.isNullable = true;
    return nullableInstance;
  }

  validateValue(value: any, dataSource: DataSource): ValidationContainer {
    const validationContainer: ValidationContainer = {
      errors: [],
      originalValue: value,
      transformedValue: null,
      source: dataSource,
    };
    this.validatorFunctions.forEach((validatorFunction) => validatorFunction(validationContainer));
    return validationContainer;
  }
}
