const Q = require("../../../../dist").default;
const middlewares = require("../../../middlewares");

module.exports.GET = Q.createRoute([
  middlewares.setupLocals,
  middlewares.getUserData,
  middlewares.createEvent,
  middlewares.createResponse,
]);
