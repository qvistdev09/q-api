import { Base } from "./base";

export interface ValidationError {
  path: string;
  error: string;
}

export type DataSource = "body" | "header" | "path" | "query";

export type ValidatorFunction = (
  path: string,
  value: any,
  errors: ValidationError[],
  dataSource: DataSource,
  setTransformedValue: (transformedValue: any) => void
) => void;

export type SchemaDerivedInterface<T> = {
  [P in keyof T]: T[P] extends Base<infer TS> ? TS : never;
};
