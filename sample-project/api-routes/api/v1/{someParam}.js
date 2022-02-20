const Q = require("../../../../dist").default;
const middlewares = require("../../../middlewares");

module.exports.GET = Q.createRoute({
  middlewares: [
    middlewares.createResponse,
    middlewares.createEvent,
    middlewares.setupLocals,
    middlewares.getUserData,
  ],
  useAuth: true,
});

module.exports.POST = Q.createRoute({
  middlewares: [
    Q.createMiddleware((req, res) => {
      res.statusCode = 201;
      res.responseData = { message: "resource created" };
    }),
  ],
  useAuth: true,
  reqBodySchema: Q.createSchema({
    schema: {
      data: {
        name: Q.string().minLength(5),
        age: Q.number().isInteger(),
      },
    },
    requireAllProperties: true,
  }),
});
