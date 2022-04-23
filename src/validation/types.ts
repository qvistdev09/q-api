export type ValidatorFunctionResult =
  | {
      result: "fail";
      errorMessage: string;
    }
  | {
      result: "success";
      transformedValue?: any;
    };

export interface ValidationResult {
  errorMessages: string[];
  value: any;
}

export type DataSource = "body" | "header" | "path" | "query";

export type ValidatorFunction = (value: any, dataSource: DataSource) => ValidatorFunctionResult;
