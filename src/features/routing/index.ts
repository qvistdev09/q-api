import FS from "fs";

const indexRecursively = (basePath: string, pathsArray: Array<string>) => {
  const directoryContents = FS.readdirSync(basePath);
  directoryContents.forEach((content) => {
    const combinedPath = `${basePath}/${content}`;
    if (FS.statSync(combinedPath).isDirectory()) {
      indexRecursively(combinedPath, pathsArray);
    } else {
      pathsArray.push(combinedPath);
    }
  });
  return pathsArray;
};

export const getNestedContents = (basePath: string) => indexRecursively(basePath, []);
