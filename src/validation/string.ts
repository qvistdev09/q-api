import { PropertyValidationResult, TypeFromSchema } from '.';
import { BaseValidation } from './base';
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
    validate: (value: any): PropertyValidationResult<t> => {
      return {
        isValid: false,
        errors: ['f'],
      };
    },
  };
};

const testSchema = {
  name: createStringValidator<string>().nullable().maxLength(25).minLength(2),
};

type TestInfer = TypeFromSchema<typeof testSchema>;

interface StringValidationSpecification {
  nullable: boolean;
  minLength: number | null;
  maxLength: number | null;
  enum: Readonly<string[]> | null;
  regex: RegExp | null;
}

export class StringValidation<T = string> extends BaseValidation<T> {
  constructor() {
    super();
    this.validatorFunctions.push(validationContainer => {
      if (typeof validationContainer.originalValue !== 'string') {
        validationContainer.errors.push({ issue: 'Value is not of type string' });
      }
    });
  }

  nullable() {
    const nullableInstance = new StringValidation<Nullable<T>>();
    nullableInstance.validatorFunctions = this.validatorFunctions;
    nullableInstance.isNullable = true;
    return nullableInstance;
  }

  maxLength(limit: number) {
    this.validatorFunctions.push(validationContainer => {
      const { originalValue } = validationContainer;
      if (typeof originalValue === 'string' && originalValue.length > limit) {
        validationContainer.errors.push({
          issue: `String cannot be longer than ${limit} characters`,
        });
      }
    });
    return this;
  }

  minLength(minCharacters: number) {
    this.validatorFunctions.push(validationContainer => {
      const { originalValue } = validationContainer;
      if (typeof originalValue === 'string' && originalValue.length < minCharacters) {
        validationContainer.errors.push({
          issue: `String must be at least ${minCharacters} characters`,
        });
      }
    });
    return this;
  }

  enum<e = string>(accepted: Readonly<e[]>) {
    this.validatorFunctions.push(validationContainer => {
      const { originalValue } = validationContainer;
      if (!accepted.includes(originalValue)) {
        validationContainer.errors.push({
          issue: `String must be one of [${accepted.join(' | ')}]`,
        });
      }
    });
    const typeChangedInstance = new StringValidation<e>();
    typeChangedInstance.validatorFunctions = this.validatorFunctions;
    return typeChangedInstance;
  }

  regex(regex: RegExp, onError: string) {
    this.validatorFunctions.push(validationContainer => {
      if (!regex.test(validationContainer.originalValue)) {
        validationContainer.errors.push({ issue: onError });
      }
    });
    return this;
  }
}
