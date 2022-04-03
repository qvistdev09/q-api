import { ValidationError, DataSource, Validator, Schema, ValidatorsMap } from "./types";
export declare class BaseVal {
    tests: Validator[];
    transformedValue: any;
    constructor();
    evaluate(objectToValidate: any, returnObject: any, path: string, errors: ValidationError[], source: DataSource): void;
}
export declare class StringVal extends BaseVal {
    constructor();
    maxLength(limit: number): this;
    minLength(minCharacters: number): this;
    enum(accepted: string[]): this;
    regex(regex: RegExp, onError: string): this;
}
export declare class NumberVal extends BaseVal {
    constructor();
    integer(): this;
    lesserThan(threshold: number): this;
    greaterThan(minimum: number): this;
}
export declare class SchemaVal {
    allowedProperties: string[];
    validatorsMap: ValidatorsMap;
    constructor(schema: Schema);
    validateObject(object: any, requireAllKeys: boolean, source: DataSource): {
        object: any;
        errors: ValidationError[];
    };
}
