import { IValidator, Source } from '.';
import { getValueViaDotNotation, setValueViaDotNotation } from './utils';

export const createObjectValidator = (objectSchema: ObjectSchema) => {
  const propertyValidators = getValidatorsFromObjectSchema(objectSchema);
  return {
    validateObject: (object: any, source: Source) => {
      const validData: any = {};
      const errors: { path: string; error: string }[] = [];
      propertyValidators.forEach(({ validator, path }) => {
        const value = getValueViaDotNotation(path, object);
        const propertyValidationResult = validator.validate(value, source);
        if (propertyValidationResult.isValid) {
          setValueViaDotNotation(path, validData, propertyValidationResult.value);
        } else {
          propertyValidationResult.errors.forEach(error => {
            const errorPath = error.index ? `${path}[${error.index}]` : path;
            errors.push({ path: errorPath, error: error.issue });
          });
        }
      });
      if (errors.length === 0) {
        return {
          isValid: true,
          data: validData,
        };
      }
      return {
        isValid: false,
        errors,
      };
    },
  };
};

const getValidatorsFromObjectSchema = (
  objectSchema: ObjectSchema,
  paths: string[] = [],
  validators: ValidatorWithPath[] = []
) => {
  const keys = Object.keys(objectSchema);
  keys.forEach(key => {
    const next = objectSchema[key];
    if (isValidator(next)) {
      validators.push({
        path: [...paths, key].join('.'),
        validator: next,
      });
    } else if (next) {
      const branchedPath = [...paths, key];
      getValidatorsFromObjectSchema(next, branchedPath, validators);
    }
  });
  return validators;
};

const isValidator = (value: any): value is IValidator<any> => {
  return typeof value?.validate === 'function';
};

interface ValidatorWithPath {
  validator: IValidator<any>;
  path: string;
}

type ObjectSchema = {
  [key: string]: IValidator<any> | ObjectSchema;
};
