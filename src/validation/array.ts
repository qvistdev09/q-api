import { FlattenType, IValidator, PropertyValidationResult, Source, TypeFromSchema } from '.';
import { createStringValidator } from './string';
import { Nullable } from './types';

export const createArrayValidator = <t>(
  elementsValidator: IValidator<any>,
  newSpecification?: ArrayValidationSpecification
) => {
  const validator = elementsValidator;
  const specification = newSpecification ?? {
    nullable: false,
    minElements: null,
    maxElements: null,
  };

  return {
    nullable: () => {
      specification.nullable = true;
      return createArrayValidator<t extends Nullable<infer TS> ? Nullable<TS> : Nullable<t>>(validator, specification);
    },
    minElements: (min: number) => {
      specification.minElements = min;
      return createArrayValidator<t>(validator, specification);
    },
    maxElements: (max: number) => {
      specification.maxElements = max;
      return createArrayValidator<t>(validator, specification);
    },
    validate: (value: any, source: Source) => validateArray<t>(specification, value, validator, source),
  };
};

const _createArrayValidator = <t>(validator: IValidator<t>) => {
  return createArrayValidator<t[]>(validator);
};

const validateArray = <t>(
  specification: ArrayValidationSpecification,
  value: any,
  validator: IValidator<any>,
  source: Source
): PropertyValidationResult<t> => {
  if (!Array.isArray(value)) {
    return {
      isValid: false,
      errors: [{ issue: 'Value must be an array' }],
    };
  }
  const elementsValidationsResults = value.map(element => validator.validate(element, source));
  if (elementsValidationsResults.every(result => result.isValid === true)) {
    return {
      isValid: true,
      value: value as any as t,
    };
  }
  const errors: { issue: string; index?: number }[] = [];
  elementsValidationsResults.forEach((result, index) => {
    if (!result.isValid) {
      errors.push(...result.errors.map(error => ({ issue: error.issue, index })));
    }
  });
  if (specification.minElements !== null && value.length < specification.minElements) {
    errors.push({ issue: `Array must contain at least ${specification.minElements} elements` });
  }
  if (specification.maxElements !== null && value.length > specification.maxElements) {
    errors.push({ issue: `Array must not contain more than ${specification.maxElements} elements` });
  }
  return {
    isValid: false,
    errors,
  };
};

interface ArrayValidationSpecification {
  nullable: boolean;
  minElements: null | number;
  maxElements: null | number;
}
