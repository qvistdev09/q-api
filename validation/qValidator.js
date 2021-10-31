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

console.log(
  confirmPathExists(testObject, ["hey"])
);

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
