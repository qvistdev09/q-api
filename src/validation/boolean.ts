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
  const errors: { issue: string }[] = [];
  if (source === 'body' && typeof value !== 'boolean') {
    errors.push({ issue: 'Value must be a boolean' });
  }
  if (source !== 'body' && !['true', 'false'].includes(value)) {
    errors.push({ issue: 'Value must be a string that can be parsed as a boolean, i.e. "true" or "false"' });
  }
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }
  return {
    isValid: true,
    value: source === 'body' ? value : value === 'true' ? true : false,
  };
};

interface BoolValidationSpecification {
  nullable: boolean;
}
