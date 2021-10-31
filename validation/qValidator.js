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

const getObjectPaths = (object, basePath = "", pathsArray = []) => {
  const keys = Object.keys(object);
  keys.forEach((key) => {
    if (isObject(object[key])) {
      getObjectPaths(
        object[key],
        `${basePath}${key}.`,
        pathsArray
      );
    } else {
      pathsArray.push(`${basePath}${key}`);
    }
  });
  return pathsArray;
};

console.log(getObjectPaths(testObject));
