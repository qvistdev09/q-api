import { QBaseValidator } from ".";
import { PairedValidator } from "./types";

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
  schema: any,
  paths: string[] = [],
  validators: PairedValidator[] = []
) => {
  const keys = Object.keys(schema);
  keys.forEach((key) => {
    const nextValue = schema[key];
    if (nextValue instanceof QBaseValidator) {
      validators.push({
        path: [...paths, key],
        validator: nextValue,
      });
    } else {
      paths.push(key);
      getValidatorsRecursively(schema[key], paths, validators);
    }
  });
  return validators;
};
