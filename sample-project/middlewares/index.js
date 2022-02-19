const Q = require("../../dist").default;

const setupLocals = Q.createMiddleware((req, res) => {
  console.log("Setting up locals");
});

const getUserData = Q.createMiddleware((req, res) => {
  console.log("Getting some user data");
}).dependsOn([setupLocals]);

const createEvent = Q.createMiddleware((req, res) => {
  console.log("Creating some event");
}).dependsOn([setupLocals, getUserData]);

const createResponse = Q.createMiddleware((req, res) => {
  res.responseData = { message: "This is a response" };
  res.statusCode = 200;
});

module.exports = {
  setupLocals,
  getUserData,
  createEvent,
  createResponse,
};
