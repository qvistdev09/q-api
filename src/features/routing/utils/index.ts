import { Middleware } from "../../middleware";
import { SegmentedMiddlewareFunctions } from "../types";

export const assertRequiredDependencies = (middlewares: Middleware[]) => {
  middlewares.forEach((middleware) => {
    middleware.dependencies.forEach((dependency) => {
      if (!middlewares.some((includedDependency) => includedDependency === dependency)) {
        throw new Error(
          `Middleware dependency missing: ${dependency.middlewareFunction.toString()}`
        );
      }
    });
  });
};

export const segmentDependencies = (middlewares: Middleware[]): SegmentedMiddlewareFunctions => {
  let remainingMiddlewares = [...middlewares];
  const segments: Array<Middleware[]> = [[]];
  while (remainingMiddlewares.length > 0) {
    let iteration = [...remainingMiddlewares];
    remainingMiddlewares.forEach((middleware) => {
      let remainingDeps = [...middleware.dependencies];
      let middlewarePlaced = false;
      segments.forEach((segment) => {
        if (remainingDeps.length === 0 && !middlewarePlaced) {
          segment.push(middleware);
          middlewarePlaced = true;
        } else {
          segment.forEach((placedMiddleware) => {
            remainingDeps = remainingDeps.filter((dependency) => dependency !== placedMiddleware);
          });
        }
      });
      if (!middlewarePlaced && remainingDeps.length === 0) {
        segments.push([middleware]);
        middlewarePlaced = true;
      }
      if (middlewarePlaced) {
        iteration = iteration.filter((nonplacedMiddleware) => nonplacedMiddleware !== middleware);
      }
    });
    remainingMiddlewares = iteration;
  }
  return segments.map((segment) => segment.map((middleware) => middleware.middlewareFunction));
};

const runNextMiddleware = (
  chain: Array<MiddleWare>,
  index: number,
  req: Request,
  res: Response,
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
  return (req: Request, res: Response) => {
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
