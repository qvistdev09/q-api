import { PropertyValidationResult, Source } from '.';
import { Nullable } from './types';

const createNumberValidator = <t extends number | Nullable<number>>(
  newSpecification?: NumberValidationSpecification
) => {
  const specification = newSpecification ?? {
    nullable: false,
    isInteger: false,
    maxAllowed: null,
    minAllowed: null,
  };

  const getUpdatedValidator = () => {
    return createNumberValidator<t>(specification);
  };

  return {
    nullable: () => {
      specification.nullable = true;
      return getUpdatedValidator();
    },
    max: (max: number) => {
      specification.maxAllowed = max;
      return getUpdatedValidator();
    },
    min: (min: number) => {
      specification.minAllowed = min;
      return getUpdatedValidator();
    },
    integer: () => {
      specification.isInteger = true;
      return getUpdatedValidator();
    },
    validate: (value: any, source: Source) => validateNumber(specification, value, source),
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
        errors,
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
      errors: ['Value must be a string that can be parsed as a number'],
    };
  }
  const parsed = Number.parseFloat(value);
  const errors = checkNumberAgainstSpecification(parsed, specification);
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
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

export const integerRegex = /^[1-9][0-9]*$|^0$/;
export const numberRegex = /(^[1-9][0-9]*$|^0$)|(^(0|[1-9][0-9]*)\.\d+$)/;

interface NumberValidationSpecification {
  nullable: boolean;
  isInteger: boolean;
  maxAllowed: number | null;
  minAllowed: number | null;
}
