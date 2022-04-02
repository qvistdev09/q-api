import { QBaseValidator } from ".";
import { ObjectSchema, PairedValidator } from "./types";

const isObject = (value: any) => {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
};

export const getNestedValue = (object: any, pathArray: Array<string>): any | null => {
  if (!pathArray[0]) {
    return null;
  }
  if (pathArray.length === 1) {
    if (isObject(object)) {
      return object[pathArray[0]] || null;
    } else {
      return null;
    }
  }
  if (!isObject(object[pathArray[0]])) {
    return null;
  }
  return getNestedValue(object[pathArray[0]], pathArray.slice(1));
};

export const getValidatorsRecursively = (
  schema: ObjectSchema,
  paths: string[] = [],
  validators: PairedValidator[] = []
) => {
  const keys = Object.keys(schema);
  keys.forEach((key) => {
    const nextValue = schema[key];
    if (nextValue instanceof QBaseValidator) {
      validators.push({
        path: [...paths, key],
        identifier: [...paths, key].join("."),
        validator: nextValue,
      });
    } else {
      const nextLevel = schema[key];
      if (nextLevel && !(nextLevel instanceof QBaseValidator)) {
        paths.push(key);
        getValidatorsRecursively(nextLevel, paths, validators);
      }
    }
  });
  return validators;
};

export const indexObjectProperties = (
  object: any,
  paths: string[] = [],
  properties: string[] = []
) => {
  if (!isObject(object)) {
    return properties;
  }
  Object.keys(object).forEach((key) => {
    const nextValue = object[key];
    if (!isObject(nextValue)) {
      properties.push([...paths, key].join("."));
    } else {
      paths.push(key);
      indexObjectProperties(object[key], paths, properties);
    }
  });
  return properties;
};
