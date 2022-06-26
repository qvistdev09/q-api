import { IValidator, PropertyValidationResult, Source } from '.';
import { BaseValidation } from './base';
import { Nullable } from './types';

const validateArray = <t extends Array<e> | Nullable<Array<e>>, e>(
  specification: ArrayValidationSpecification,
  value: any,
  validator: IValidator<e>,
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
      value: value as t,
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

export class ArrayValidation<T> extends BaseValidation<Array<T>> {
  validator: BaseValidation<T>;

  constructor(validator: BaseValidation<T>) {
    super();
    this.validator = validator;
    this.validatorFunctions.push(validationContainer => {
      const { originalValue, errors, source } = validationContainer;
      if (!Array.isArray(originalValue)) {
        errors.push({ issue: 'Value is not an array' });
        return;
      }
      originalValue.forEach((element, index) => {
        const elementValidationResult = validator.validateValue(element, source);
        elementValidationResult.errors = elementValidationResult.errors.map(errorObject => ({
          issue: errorObject.issue,
          index,
        }));
        validationContainer.errors = [...validationContainer.errors, ...elementValidationResult.errors];
      });
    });
  }

  nullable() {
    const nullableInstance = new ArrayValidation<Nullable<T>>(this.validator);
    nullableInstance.validatorFunctions = this.validatorFunctions;
    nullableInstance.isNullable = true;
    return nullableInstance;
  }

  minLength(min: number) {
    this.validatorFunctions.push(validationContainer => {
      const { originalValue, errors } = validationContainer;
      if (Array.isArray(originalValue) && originalValue.length < min) {
        errors.push({ issue: `Array must have a length that is ${min} minimum` });
      }
    });
    return this;
  }

  maxLength(max: number) {
    this.validatorFunctions.push(validationContainer => {
      const { originalValue, errors } = validationContainer;
      if (Array.isArray(originalValue) && originalValue.length > max) {
        errors.push({ issue: `Array must have a length that is ${max} maximum` });
      }
    });
    return this;
  }
}
