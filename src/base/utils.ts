import FS from "fs";
import http from "http";
import { httpMethods } from "../consts";
import { Endpoint, ImportedRoutes, UrlMatcherResult } from "./types";

const javascriptFile = /\.js$/;

const indexRecursively = (basePath: string, pathsArray: Array<string>) => {
  const directoryContents = FS.readdirSync(basePath);
  directoryContents.forEach((content) => {
    const combinedPath = `${basePath}/${content}`;
    if (FS.statSync(combinedPath).isDirectory()) {
      indexRecursively(combinedPath, pathsArray);
    } else if (javascriptFile.test(combinedPath)) {
      pathsArray.push(combinedPath);
    }
  });
  return pathsArray;
};

export const getNestedContents = (basePath: string) => indexRecursively(basePath, []);

export const createUrlMatcherFunction = (
  basePath: string,
  filePath: string
): ((requestUrl: string) => UrlMatcherResult) => {
  const cleanedPath = filePath.replace(basePath, "").replace(/\.js$/, "");
  const urlParameters = cleanedPath.match(/{.+}/g) || [];

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
      params: matchResult.groups || {},
    };
  };
};

export const getEndpointsFromFiles = (basePath: string): Endpoint[] => {
  const endpoints: Endpoint[] = [];
  getNestedContents(basePath).forEach((file) => {
    const routeConfig = require(file) as ImportedRoutes;
    const endpoint: Endpoint = {
      matcher: createUrlMatcherFunction(basePath, file),
      methods: {},
    };
    httpMethods.forEach((method) => {
      if (routeConfig[method]) {
        endpoint.methods[method] = routeConfig[method];
      }
    });
    endpoints.push(endpoint);
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
