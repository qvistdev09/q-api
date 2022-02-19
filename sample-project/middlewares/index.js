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
      res.responseData = { message: "This is a response" };
      res.statusCode = 200;
      resolve();
    }, 1000);
  });
}).dependsOn([setupLocals, getUserData, createEvent]);

module.exports = {
  setupLocals,
  getUserData,
  createEvent,
  createResponse,
};
