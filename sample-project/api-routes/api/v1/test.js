module.exports = {
  GET: [
    (req, res) => {
      res.status(200).json({ message: "Testing sample api " });
    },
  ],
};
