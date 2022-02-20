import { QBaseValidator } from ".";

export interface ValidationError {
  property: string;
  error: string;
}

export type PropertyValidator = (identifier: string, value: any) => ValidationError | null;

export interface PairedValidator {
  validator: QBaseValidator;
  identifier: string;
  path: Array<string>;
}

export interface QSchemaConfig {
  schema: any;
  requireAllProperties: boolean;
}