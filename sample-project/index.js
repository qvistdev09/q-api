const Q = require("../dist/index").default;
const path = require("path");

const api = Q.createApi(path.resolve(__dirname, "./api-routes"));

api.listen(3000);
