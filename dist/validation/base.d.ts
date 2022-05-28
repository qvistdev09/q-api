import { DataSource, ValidationContainer, ValidatorFunction } from "./types";
export declare class BaseValidation<GoalType> {
    _savedGoalType: GoalType;
    validatorFunctions: ValidatorFunction[];
    isNullable: boolean;
    constructor();
    validateValue(value: any, dataSource: DataSource): ValidationContainer;
}
