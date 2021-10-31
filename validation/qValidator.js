class QField {
  constructor() {
    this.fieldValidators = [];
  }

  string() {
    this.fieldValidators.push((value) => typeof value === "string");
    return this;
  }

  minimumLength(length) {
    this.fieldValidators.push((value) => value.length >= length);
    return this;
  }

  maximumLength(length) {
    this.fieldValidators.push((value) => value.length <= length);
    return this;
  }

  enum(array) {
    this.fieldValidators.push((value) => array.includes(value));
    return this;
  }

  validate(value) {
    return this.fieldValidators.every((validator) => validator(value) === true);
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

const getNestedValue = (object, pathArray) => {
  if (pathArray.length === 1) {
    if (isObject(object) && !isObject(object[pathArray[0]])) {
      return object[pathArray[0]] !== undefined ? object[pathArray[0]] : null;
    } else {
      return null;
    }
  }
  if (!isObject(object[pathArray[0]])) {
    return null;
  }
  return getNestedValue(object[pathArray[0]], pathArray.slice(1));
};

const validatorsFromObject = (object, paths = [], validators = []) => {
  const keys = Object.keys(object);
  keys.forEach((key) => {
    if (object[key] instanceof QField) {
      validators.push({
        pathArray: [...paths, key],
        validator: object[key],
      });
    } else {
      paths.push(key);
      validatorsFromObject(object[key], paths, validators);
    }
  });
  return validators;
};

const stringTest = new QField().string().enum(["oscar", "potatis"]);

class QVal {
  constructor(schema) {
    this.validators = validatorsFromObject(schema);
  }
}

const dogValidator = new QVal({
  name: new QField().string(),
  bestFriend: new QField().enum(["peter", "amanda"]),
  favorites: {
    food: new QField().string(),
    drink: new QField().string(),
    supernested: {
      evenmore: {
        test: new QField().string(),
      },
    },
  },
});
