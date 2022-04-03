import { BaseVal } from "./index";

export interface ValidationError {
  path: string;
  error: string;
}

export type DataSource = "body" | "header" | "path" | "query";

export type Validator = (
  path: string,
  value: any,
  errors: ValidationError[],
  source: DataSource,
  setTransformedValue: (transformed: any) => void
) => void;

export interface Schema {
  [key: string]: BaseVal | Schema;
}

export interface ValidatorPairedWithPath {
  validator: BaseVal;
  path: string;
}

export type ValidatorsMap = Record<string, ValidatorPairedWithPath>;
