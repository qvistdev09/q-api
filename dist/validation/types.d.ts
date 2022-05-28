import { BaseValidation } from "./base";
export declare type DataSource = "body" | "header" | "params" | "query";
export interface ValidationContainer {
    errors: Array<{
        issue: string;
        index?: number;
    }>;
    originalValue: any;
    transformedValue: any;
    source: DataSource;
}
export declare type ValidatorFunction = (validationContainer: ValidationContainer) => void;
export declare type SchemaDerivedInterface<T> = {
    [P in keyof T]: T[P] extends BaseValidation<infer TS> ? TS : SchemaDerivedInterface<T[P]>;
};
export interface ObjectValidationResult {
    data: any;
    errors: Array<{
        path: string;
        issue: string;
    }>;
}
export interface Schema {
    [key: string]: BaseValidation<any> | Schema;
}
export interface PairedValidator {
    validator: BaseValidation<any>;
    path: string;
}
export declare type Nullable<T> = T | null | undefined;
