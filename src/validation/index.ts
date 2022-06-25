export type Source = 'body' | 'header' | 'params' | 'query';

export type PropertyValidationResult<t> =
  | {
      isValid: false;
      errors: Array<{ issue: string; index?: number }>;
    }
  | {
      isValid: true;
      value: t;
    };

export interface IValidator<t> {
  validate: (value: any, source: Source) => PropertyValidationResult<t>;
}

export type TypeFromSchema<T> = {
  [P in keyof T]: T[P] extends IValidator<infer TS> ? TS : TypeFromSchema<T[P]>;
};

export type FlattenType<T> = T extends object ? { [K in keyof T]: FlattenType<T[K]> } : T;

export type Nullable<T> = T | null | undefined;
