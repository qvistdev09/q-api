const Q = require("../dist/index").default;
const path = require("path");

const api = Q.createApi(path.resolve(__dirname, "./api-routes"), (req, res) => {
  res.status(500).json({ error: "Something went wrong" });
});

api.listen(3000);
