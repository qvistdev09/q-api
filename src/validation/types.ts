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

export interface ObjectSchema {
  [key: string]: QBaseValidator | ObjectSchema;
}

export interface QSchemaConfig {
  schema: ObjectSchema;
  requireAllProperties: boolean;
}
