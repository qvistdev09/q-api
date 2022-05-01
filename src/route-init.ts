import FS from "fs";
import http from "http";
import { BaseEndpoint } from "./base-endpoint";

export interface UrlMatcherResult {
  match: boolean;
  params?: Record<string, string>;
}

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

export const importEndpoints = (baseFolder: string): BaseEndpoint[] => {
  const endpoints: BaseEndpoint[] = [];
  getFilePaths(baseFolder).forEach((filePath) => {
    const module = require(filePath);
    const { endpoint } = module;
    if (endpoint instanceof BaseEndpoint) {
      endpoint.urlMatcher = createUrlMatcherFunction(baseFolder, filePath);
      endpoints.push(endpoint);
    }
  });
  return endpoints;
};

export const contentTypeJSON = (httpReq: http.IncomingMessage) => {
  if (
    httpReq.headers["content-type"] &&
    httpReq.headers["content-type"].toLowerCase() === "application/json"
  ) {
    return true;
  }
  return false;
};
