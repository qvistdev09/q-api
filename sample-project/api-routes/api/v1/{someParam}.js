const Q = require("../../../../dist").default;
const middlewares = require("../../../middlewares");

module.exports.GET = Q.createRoute([
  middlewares.createResponse,
  middlewares.createEvent,
  middlewares.setupLocals,
  middlewares.getUserData,
]);
