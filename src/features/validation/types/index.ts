import { QBaseValidator } from "../classes";

export interface ValidationError {
  property: string;
  error: string;
}

export type PropertyValidator = (identifier: string, value: any) => ValidationError | null;

export interface PairedValidator {
  validator: QBaseValidator;
  path: Array<string>;
}