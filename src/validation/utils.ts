import { BaseValidation } from "./base";
import { PairedValidator, Schema } from "./types";

const isObject = (value: any) => {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
};

export const getValidatorsRecursively = (
  schema: Schema,
  paths: string[] = [],
  validators: PairedValidator[] = []
) => {
  const keys = Object.keys(schema);
  keys.forEach((key) => {
    const nextValue = schema[key];
    if (nextValue instanceof BaseValidation) {
      validators.push({
        path: [...paths, key].join("."),
        validator: nextValue,
      });
    } else {
      const nextLevel = schema[key];
      if (nextLevel && !(nextLevel instanceof BaseValidation)) {
        const newPaths = [...paths, key];
        getValidatorsRecursively(nextLevel, newPaths, validators);
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
      const newPaths = [...paths, key];
      indexObjectProperties(object[key], newPaths, properties);
    }
  });
  return properties;
};

export const getValueViaDotNotation = (path: string, data: any): any => {
  return path.split(".").reduce((object: any, accessor: string) => {
    if (object === undefined || object === null) {
      return null;
    }
    return object[accessor];
  }, data);
};

export const setValueViaDotNotation = (path: string, data: any, value: any) => {
  let currentLevel = data;
  path.split(".").forEach((accessor: string, index, array) => {
    if (index === array.length - 1) {
      currentLevel[accessor] = value;
    } else {
      if (isObject(currentLevel[accessor])) {
        currentLevel = currentLevel[accessor];
      } else {
        currentLevel[accessor] = {};
        currentLevel = currentLevel[accessor];
      }
    }
  });
};
