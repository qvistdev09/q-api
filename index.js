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

class QvistdevApi {
  constructor(basepath) {
    this.handlers = [];
    this.server = http.createServer(this.handleRequest);
    getRoutePaths(basepath).forEach((path) => {
      this.handlers.push({
        matcher: (url) => url === path,
        methods: require(path),
      });
    });
  }

  handleRequest(req, res) {
    res.end("Tjolaho");
  }

  listen(port) {
    this.server.listen(port, () =>
      console.log(`Qvistdev API is listening on port ${port}`)
    );
  }
}

const qvistdevApi = new QvistdevApi("./api-paths");

qvistdevApi.listen(3000);
