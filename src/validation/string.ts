import { PropertyValidationResult } from '.';
import { Nullable } from './types';

const createStringValidator = <t>(newSpecification?: StringValidationSpecification) => {
  const specification = newSpecification ?? {
    nullable: false,
    minLength: null,
    maxLength: null,
    enum: null,
    regex: null,
  };

  return {
    nullable: () => {
      specification.nullable = true;
      return createStringValidator<t extends Nullable<infer TS> ? Nullable<TS> : Nullable<t>>(specification);
    },
    minLength: (max: number) => {
      specification.minLength = max;
      return createStringValidator<t>(specification);
    },
    maxLength: (max: number) => {
      specification.maxLength = max;
      return createStringValidator<t>(specification);
    },
    enum: <e extends Readonly<string[]>>(values: e) => {
      specification.enum = values;
      return createStringValidator<t extends string ? Readonly<e>[number] : Nullable<Readonly<e>[number]>>(
        specification
      );
    },
    validate: (value: any) => validateString<t>(specification, value),
  };
};

const validateString = <t>(specification: StringValidationSpecification, value: any): PropertyValidationResult<t> => {
  if (specification.nullable && [null, undefined].includes(value)) {
    return {
      isValid: true,
      value,
    };
  }
  const errors: string[] = [];
  if (typeof value !== 'string') {
    errors.push('Value must be a string');
  }
  if (specification.minLength !== null && typeof value === 'string' && value.length < specification.minLength) {
    errors.push(`String must be at least ${specification.minLength} characters long`);
  }
  if (specification.maxLength !== null && typeof value === 'string' && value.length > specification.maxLength) {
    errors.push(`String cannot be longer than ${specification.minLength} characters`);
  }
  if (specification.enum !== null && typeof value === 'string' && !specification.enum.includes(value)) {
    errors.push(`String must be one of the accepted values: ${specification.enum.join('|')}`);
  }
  if (specification.regex !== null && typeof value === 'string' && !specification.regex.test(value)) {
    errors.push('String does not match regex');
  }
  if (errors.length > 0) {
    return {
      isValid: false,
      errors: errors.map(issue => ({ issue })),
    };
  }
  return {
    isValid: true,
    value,
  };
};

interface StringValidationSpecification {
  nullable: boolean;
  minLength: number | null;
  maxLength: number | null;
  enum: Readonly<string[]> | null;
  regex: RegExp | null;
}
