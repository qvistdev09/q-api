const testObject = {
  hey: 12,
  post: 24,
  something: {
    anotherThings: {
      valueIs: "potato",
      tjoho: {
        miho: 12,
      },
    },
  },
};

const isObject = (value) => {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
};

const confirmPathExists = (object, pathArray) => {
  if (pathArray.length === 1) {
    return (
      !isObject(object[pathArray[0]]) && object[pathArray[0]] !== undefined
    );
  }
  if (!isObject(object[pathArray[0]])) {
    return false;
  }
  return confirmPathExists(object[pathArray[0]], pathArray.slice(1));
};

const getObjectPaths = (object, basePath = "", pathsArray = []) => {
  const keys = Object.keys(object);
  keys.forEach((key) => {
    if (isObject(object[key])) {
      getObjectPaths(object[key], `${basePath}${key}.`, pathsArray);
    } else {
      pathsArray.push({
        path: `${basePath}${key}`.split("."),
        value: object[key],
      });
    }
  });
  return pathsArray;
};

class QVal {
  constructor() {
    this.validators = [];
  }

  string() {
    this.validators.push((value) => typeof value === "string");
    return this;
  }

  minimumLength(length) {
    this.validators.push((value) => value.length >= length);
    return this;
  }

  maximumLength(length) {
    this.validators.push((value) => value.length <= length);
    return this;
  }

  enum(array) {
    this.validators.push((value) => array.includes(value));
    return this;
  }

  validate(value) {
    return this.validators.every((validator) => validator(value) === true);
  }
}

const stringTest = new QVal().string().enum(["oscar", "potatis"]);

console.log(stringTest.validate("fdsfds"));
