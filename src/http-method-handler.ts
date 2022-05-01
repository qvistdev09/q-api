import { HttpMethodHandlerFunction } from "./types";
import { Schema } from "./validation/types";

export class HttpMethodHandler<BodySchema, PathSchema, QuerySchema> {
  bodySchema: Schema;
  paramsSchema: Schema;
  querySchema: Schema;
  handlerFunction: HttpMethodHandlerFunction<BodySchema, PathSchema, QuerySchema> | null;

  constructor(bodySchema: any, paramsSchema: any, querySchema: any) {
    this.bodySchema = bodySchema;
    this.paramsSchema = paramsSchema;
    this.querySchema = querySchema;
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
}
