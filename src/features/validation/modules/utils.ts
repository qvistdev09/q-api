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
