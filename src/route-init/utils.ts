import FS from "fs";
import { UrlMatcherResult } from "./types";

const javascriptFile = /\.js$/;

export const getFilePaths = (baseDirectory: string, filePaths: string[] = []) => {
  const directoryContents = FS.readdirSync(baseDirectory);
  directoryContents.forEach((content) => {
    const combinedPath = `${baseDirectory}/${content}`;
    if (FS.statSync(combinedPath).isDirectory()) {
      getFilePaths(combinedPath, filePaths);
    } else if (javascriptFile.test(combinedPath)) {
      filePaths.push(combinedPath);
    }
  });
  return filePaths;
};

export const createUrlMatcherFunction = (
  basePath: string,
  filePath: string
): ((requestUrl: string) => UrlMatcherResult) => {
  const cleanedPath = filePath.replace(basePath, "").replace(/\.js$/, "");
  const urlParameters = cleanedPath.match(/{.+}/g) ?? [];

  let urlRegexString = cleanedPath;

  urlParameters.forEach((parameter) => {
    const cleanedParam = parameter.replace(/[{}]/g, "");
    urlRegexString = urlRegexString.replace(parameter, `(?<${cleanedParam}>[A-Za-z0-9]+)`);
  });

  const matcherRegex = new RegExp(`^${urlRegexString}($|\\?.*)`);

  return (requestUrl: string) => {
    const matchResult = requestUrl.match(matcherRegex);
    if (matchResult === null) {
      return {
        match: false,
      };
    }
    return {
      match: true,
      params: matchResult.groups ?? {},
    };
  };
};
