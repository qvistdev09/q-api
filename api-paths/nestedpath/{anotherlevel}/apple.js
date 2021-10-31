module.exports = {
  GET: [
    (req, res, next) => {
      res.end(req.url);
    },
  ],
};
