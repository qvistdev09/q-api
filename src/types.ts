import { AuthedContext, Context } from "./context";
import { Schema } from "./validation/types";

export type HttpMethodHandlerFunction<
  BodySchema extends Schema,
  ParamsSchema extends Schema,
  QuerySchema extends Schema
> = (context: Context<BodySchema, ParamsSchema, QuerySchema>) => any | Promise<any>;

export type AuthedHttpMethodHandlerFunction<
  BodySchema extends Schema,
  ParamsSchema extends Schema,
  QuerySchema extends Schema
> = (context: AuthedContext<BodySchema, ParamsSchema, QuerySchema>) => any | Promise<any>;
