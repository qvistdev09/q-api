import { Nullable, Source, PropertyValidationResult } from './';

const createBooleanValidator = <t extends boolean | Nullable<boolean>>(
  newSpecification?: BoolValidationSpecification
) => {
  const specification = newSpecification ?? {
    nullable: false,
  };

  return {
    nullable: () => {
      specification.nullable = true;
      return createBooleanValidator<t extends Nullable<infer TS> ? Nullable<TS> : Nullable<t>>(specification);
    },
    validate: (value: any, source: Source) => validateBoolean<t>(specification, value, source),
  };
};

const validateBoolean = <t extends boolean | Nullable<boolean>>(
  specification: BoolValidationSpecification,
  value: any,
  source: Source
): PropertyValidationResult<t> => {
  if (specification.nullable && [null, undefined].includes(value)) {
    return {
      isValid: true,
      value,
    };
  }
  if (source === 'body' && typeof value === 'boolean') {
    return {
      isValid: true,
      value: value as t,
    };
  }
  return {
    isValid: true,
    value: true as t,
  };
};

interface BoolValidationSpecification {
  nullable: boolean;
}
