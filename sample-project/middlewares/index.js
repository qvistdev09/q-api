const Q = require("../../dist").default;

const setupLocals = Q.createMiddleware((req, res) => {
  console.log("1. Setting up locals");
});

const getUserData = Q.createMiddleware((req, res) => {
  console.log("2. Getting some user data");
}).dependsOn([setupLocals]);

const createEvent = Q.createMiddleware((req, res) => {
  console.log("3. Creating some event");
}).dependsOn([setupLocals, getUserData]);

const createResponse = Q.createMiddleware((req, res) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("4. Creating response");
      const tokenLifetime = (req.user.exp - req.user.iat);
      res.responseData = { ...req.user, tokenLifetime };
      res.statusCode = 200;
      resolve();
    }, 100);
  });
}).dependsOn([setupLocals, getUserData, createEvent]);

module.exports = {
  setupLocals,
  getUserData,
  createEvent,
  createResponse,
};
