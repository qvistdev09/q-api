import { PropertyValidationResult, Source } from '.';
import { Nullable } from './types';

export const createNumberValidator = <t extends number | Nullable<number>>(
  newSpecification?: NumberValidationSpecification
) => {
  const specification = newSpecification ?? {
    nullable: false,
    isInteger: false,
    maxAllowed: null,
    minAllowed: null,
  };

  return {
    nullable: () => {
      specification.nullable = true;
      return createNumberValidator<t extends Nullable<infer TS> ? Nullable<TS> : Nullable<t>>(specification);
    },
    max: (max: number) => {
      specification.maxAllowed = max;
      return createNumberValidator<t>(specification);
    },
    min: (min: number) => {
      specification.minAllowed = min;
      return createNumberValidator<t>(specification);
    },
    integer: () => {
      specification.isInteger = true;
      return createNumberValidator<t>(specification);
    },
    validate: (value: any, source: Source) => validateNumber<t>(specification, value, source),
  };
};

const validateNumber = <t extends number | Nullable<number>>(
  specification: NumberValidationSpecification,
  value: any,
  source: Source
): PropertyValidationResult<t> => {
  if (specification.nullable && [null, undefined].includes(value)) {
    return {
      isValid: true,
      value,
    };
  }
  if (source === 'body') {
    const errors: string[] = [];
    if (typeof value !== 'number') {
      errors.push('Value must be a number');
    }
    errors.push(...checkNumberAgainstSpecification(value, specification));
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
  }
  const valueIsParseableString = typeof value === 'string' && numberRegex.test(value);
  if (!valueIsParseableString) {
    return {
      isValid: false,
      errors: [{ issue: 'Value must be a string that can be parsed as a number' }],
    };
  }
  const parsed = Number.parseFloat(value);
  const errors = checkNumberAgainstSpecification(parsed, specification);
  if (errors.length > 0) {
    return {
      isValid: false,
      errors: errors.map(issue => ({ issue })),
    };
  }
  return {
    isValid: true,
    value: parsed as t,
  };
};

const checkNumberAgainstSpecification = (value: number, specification: NumberValidationSpecification) => {
  const errors: string[] = [];
  if (specification.maxAllowed && typeof value === 'number' && value > specification.maxAllowed) {
    errors.push(`Value cannot be greater than ${specification.maxAllowed}`);
  }
  if (specification.minAllowed && typeof value === 'number' && value < specification.minAllowed) {
    errors.push(`Value cannot be lesser than ${specification.minAllowed}`);
  }
  if (specification.isInteger && !Number.isInteger(value)) {
    errors.push('Value must be an integer');
  }
  return errors;
};

const numberRegex = /(^[1-9][0-9]*$|^0$)|(^(0|[1-9][0-9]*)\.\d+$)/;

interface NumberValidationSpecification {
  nullable: boolean;
  isInteger: boolean;
  maxAllowed: number | null;
  minAllowed: number | null;
}
