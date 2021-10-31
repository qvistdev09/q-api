const FS = require("fs");
const http = require("http");

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
  return (reqUrl) => reqUrl === urlMatcherString;
};

class QvistdevApi {
  constructor(basepath) {
    this.handlers = [];
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
    getRoutePaths(basepath).forEach((path) => {
      this.handlers.push({
        matcher: createUrlMatcher(basepath, path),
        methods: require(path),
      });
    });
  }

  handleRequest(req, res) {
    const matchingHandler = this.handlers.find((handler) =>
      handler.matcher(req.url)
    );
    if (matchingHandler && matchingHandler.methods[req.method]) {
      matchingHandler.methods[req.method](req, res);
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

qvistdevApi.listen(3000);
