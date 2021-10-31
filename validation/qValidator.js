class QField {
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

const validatorsFromObject = (object, basePath = "", pathsArray = []) => {
  const keys = Object.keys(object);
  keys.forEach((key) => {
    if (object[key] instanceof QField) {
      pathsArray.push({
        path: `${basePath}${key}`,
        value: object[key],
      });
    } else {
      validatorsFromObject(object[key], `${basePath}${key}.`, pathsArray);
    }
  });
  return pathsArray;
};

const stringTest = new QField().string().enum(["oscar", "potatis"]);

const dogValidation = {
  name: new QField().string(),
  bestFriend: new QField().enum(["peter", "amanda"]),
  favorites: {
    food: new QField().string(),
    drink: new QField().string(),
  },
};

class QVal {
  constructor(schema) {}
}

console.log(validatorsFromObject(dogValidation));
