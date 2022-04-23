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
