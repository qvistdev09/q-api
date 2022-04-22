export interface ValidationError {
  path: string;
  error: string;
}

export type DataSource = "body" | "header" | "path" | "query";

export type ValidatorFunction<T> = (
  path: string,
  value: any,
  errors: ValidationError[],
  dataSource: DataSource,
  setTransformedValue: (transformedValue: T) => void
) => void;
