const FS = require("fs");
const http = require("http");
const url = require("url");

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

const createUrlMatcher = (basepath, filePath) => {
  const urlMatcherString = filePath.replace(basepath, "").replace(/\.js$/, "");
  return (reqUrl) => reqUrl.includes(urlMatcherString);
};

const createMiddlewareChain = (middlewareArray, errorHandler) => {
  return (req, res) => {
    let index = 0;
    const getNext = (error) => {
      if (error !== undefined) {
        return errorHandler(error, req, res);
      }
      index++;
      middlewareArray[index](req, res, getNext);
    };
    middlewareArray[index](req, res, getNext);
  };
};

class QvistdevApi {
  constructor(basepath) {
    this.handlers = [];
    this.errorHandler = null;
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
    getRoutePaths(basepath).forEach((path) => {
      const methodsArrays = require(path);
      this.handlers.push({
        matcher: createUrlMatcher(basepath, path),
        methods: {
          GET: createMiddlewareChain(methodsArrays.GET, (err, req, res) =>
            this.errorHandler(err, req, res)
          ),
        },
      });
    });
  }

  parseQuery(req) {
    req.query = url.parse(req.url, true).query;
  }

  handleRequest(req, res) {
    const matchingHandler = this.handlers.find((handler) =>
      handler.matcher(req.url)
    );
    if (matchingHandler && matchingHandler.methods[req.method]) {
      this.parseQuery(req);
      let bodyString = "";
      req.on("data", (chunk) => {
        bodyString += chunk.toString();
      });
      req.on("end", () => {
        try {
          const jsonBody = JSON.parse(bodyString);
          req.body = jsonBody;
          matchingHandler.methods[req.method](req, res);
        } catch (err) {
          matchingHandler.methods[req.method](req, res);
        }
      });
    } else {
      res.end("No matching handler");
    }
  }

  listen(port) {
    this.server.listen(port, () =>
      console.log(`Qvistdev API is listening on port ${port}`)
    );
  }
}

const qvistdevApi = new QvistdevApi("./api-paths");

qvistdevApi.errorHandler = (error, req, res) => {
  res.end(error);
};

console.log(qvistdevApi.handlers);

qvistdevApi.listen(3000);
