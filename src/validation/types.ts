export type DataSource = "body" | "header" | "path" | "query";

export interface ValidationContainer {
  errors: string[];
  originalValue: any;
  transformedValue: any;
  source: DataSource;
}

export type ValidatorFunction = (validationContainer: ValidationContainer) => void;
