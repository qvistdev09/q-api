module.exports = {
  GET: [
    (req, res, next) => {
      res.end("very nested path");
    },
  ],
};
