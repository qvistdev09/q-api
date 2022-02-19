module.exports = {
  GET: [
    (req, res, next) => {
      res.locals = { data: "some data" };
      next();
    },
    (req, res, next) => {
      res.status(200).json(res.locals);
    },
  ],
};
