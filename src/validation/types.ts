import { BaseValidation } from "./base";

export type DataSource = "body" | "header" | "path" | "query";

export interface ValidationContainer {
  errors: string[];
  originalValue: any;
  transformedValue: any;
  source: DataSource;
}

export type ValidatorFunction = (validationContainer: ValidationContainer) => void;

export type SchemaDerivedInterface<T> = {
  [P in keyof T]: T[P] extends BaseValidation<infer TS> ? TS : never;
};

export interface ObjectValidationResult {
  data: any;
  errors: Array<{
    path: string;
    errors: string[];
  }>;
}

export interface Schema {
  [key: string]: BaseValidation<any> | Schema;
}

export interface PairedValidator {
  validator: BaseValidation<any>;
  path: string;
}
