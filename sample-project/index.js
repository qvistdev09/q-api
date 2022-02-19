const Q = require("../dist/index").default;
const path = require("path");

const api = Q.createApi({
  basePath: path.resolve(__dirname, "./api-routes"),
  authConfig: {
    auth0HostName: "qvistdev09.eu.auth0.com",
  },
});

api.listen(3000);
