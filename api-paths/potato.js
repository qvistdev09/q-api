module.exports = {
  GET: [
    (req, res, next) => {
      console.log("First function");
      next();
    },
    (req, res, next) => {
      console.log("Doing some more stuff");
      next();
    },
    (req, res, next) => {
      res.end("ending middleware now");
    },
  ],
  POST: (req, res) => res.end("potato post path"),
};
