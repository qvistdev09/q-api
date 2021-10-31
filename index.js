const FS = require("fs");

const getRoutePaths = (basePath, pathsArray = []) => {
  const directoryContents = FS.readdirSync(basePath);
  directoryContents.forEach((content) => {
    if (FS.statSync(`${basePath}/${content}`).isDirectory()) {
      getRoutePaths(`${basePath}/${content}`, pathsArray);
    } else {
      pathsArray.push(`${basePath}/${content}`);
    }
  });
  return pathsArray;
};

console.log(getRoutePaths("./api-paths"));
