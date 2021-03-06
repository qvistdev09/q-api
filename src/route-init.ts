import FS from "fs";
import { Service } from "./api";
import { BaseEndpoint } from "./base-endpoint";

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

export const importEndpoints = (baseFolder: string, services: Service[]): BaseEndpoint[] => {
  const endpoints: BaseEndpoint[] = [];
  getFilePaths(baseFolder).forEach((filePath) => {
    const { Endpoint } = require(filePath);
    const requestedServicesNames = (Endpoint.services ?? []) as string[];
    const matchedServices = requestedServicesNames.map((name) => {
      const matchedService = services.find((service) => service.name === name);
      if (matchedService) {
        return matchedService.reference;
      }
      throw new Error(`Undefined service: ${name}`);
    });
    const endpoint = new Endpoint(...matchedServices);
    if (endpoint instanceof BaseEndpoint) {
      endpoint.urlMatcher = createUrlMatcherFunction(baseFolder, filePath);
      endpoints.push(endpoint);
    }
  });
  return endpoints;
};

export interface UrlMatcherResult {
  match: boolean;
  params?: Record<string, string>;
}
