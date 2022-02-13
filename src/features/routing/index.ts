import FS from "fs";
import { MiddleWare, UrlMatcherResult } from "../../types";
import { Qreq, Qres } from "../request";

const runNextMiddleware = (
  chain: Array<MiddleWare>,
  index: number,
  req: Qreq,
  res: Qres,
  errorHandler: MiddleWare
) => {
  const scheduledMiddleware = chain[index];
  index++;
  if (scheduledMiddleware) {
    scheduledMiddleware(req, res, (error) => {
      if (error) {
        errorHandler(req, res);
        return;
      }
      runNextMiddleware(chain, index, req, res, errorHandler);
    });
  }
};

export const createRouteHandler = (
  chain: Array<MiddleWare>,
  errorHandler: MiddleWare
): MiddleWare => {
  return (req: Qreq, res: Qres) => {
    let index = 0;
    runNextMiddleware(chain, index, req, res, errorHandler);
  };
};

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

export const createUrlMatcherFunction = (
  basePath: string,
  filePath: string
): ((requestUrl: string) => UrlMatcherResult) => {
  const cleanedPath = filePath.replace(basePath, "").replace(/\.js$/, "");
  const urlParameters = cleanedPath.match(/{[a-zA-Z0-9]+}/g) || [];

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
