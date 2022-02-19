const Q = require("../dist/index").default;
const path = require("path");

Q.loadEnv();

const api = Q.createApi({
  basePath: path.resolve(__dirname, "./api-routes"),
  authConfig: {
    auth0HostName: process.env.auth0HostName,
  },
});

api.listen(3000);
