import { HttpMethodHandlerFunction, AuthedHttpMethodHandlerFunction } from "./types";
import { Schema } from "./validation/types";

export class HttpMethodHandler<BodySchema, PathSchema, QuerySchema> {
  bodySchema: Schema | null;
  paramsSchema: Schema | null;
  querySchema: Schema | null;
  handlerFunction: HttpMethodHandlerFunction<BodySchema, PathSchema, QuerySchema> | null;

  constructor(bodySchema?: any, paramsSchema?: any, querySchema?: any) {
    this.bodySchema = bodySchema ?? null;
    this.paramsSchema = paramsSchema ?? null;
    this.querySchema = querySchema ?? null;
    this.handlerFunction = null;
  }

  setHandler(handlerFunction: HttpMethodHandlerFunction<BodySchema, PathSchema, QuerySchema>) {
    this.handlerFunction = handlerFunction;
  }

  addBodyValidation<t>(schema: t) {
    const newInstance = new HttpMethodHandler<t, PathSchema, QuerySchema>(
      schema,
      this.paramsSchema,
      this.querySchema
    );
    return newInstance;
  }

  addParamsValidation<t>(schema: t) {
    const newInstance = new HttpMethodHandler<BodySchema, t, QuerySchema>(
      this.bodySchema,
      schema,
      this.querySchema
    );
    return newInstance;
  }

  addQueryValidation<t>(schema: t) {
    const newInstance = new HttpMethodHandler<BodySchema, PathSchema, t>(
      this.bodySchema,
      this.paramsSchema,
      schema
    );
    return newInstance;
  }

  useAuth() {
    const newInstance = new AuthedHttpMethodHandler<BodySchema, PathSchema, QuerySchema>(
      this.bodySchema,
      this.paramsSchema,
      this.querySchema
    );
    return newInstance;
  }
}

export class AuthedHttpMethodHandler<BodySchema, PathSchema, QuerySchema> extends HttpMethodHandler<
  BodySchema,
  PathSchema,
  QuerySchema
> {
  authedHandlerFunction: AuthedHttpMethodHandlerFunction<
    BodySchema,
    PathSchema,
    QuerySchema
  > | null;
  constructor(bodySchema?: any, paramsSchema?: any, querySchema?: any) {
    super(bodySchema, paramsSchema, querySchema);
    this.authedHandlerFunction = null;
  }

  setHandler(
    handlerFunction: AuthedHttpMethodHandlerFunction<BodySchema, PathSchema, QuerySchema>
  ) {
    this.authedHandlerFunction = handlerFunction;
  }
}
