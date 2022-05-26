import { AuthedContext, Context } from "./context";
import { Schema } from "./validation/types";

export interface HttpMethodHandlerResponse {
  data: any;
  statusCode: number;
}

export type HttpMethodHandlerFunction<
  BodySchema extends Schema,
  ParamsSchema extends Schema,
  QuerySchema extends Schema
> = (
  context: Context<BodySchema, ParamsSchema, QuerySchema>
) => HttpMethodHandlerResponse | Promise<HttpMethodHandlerResponse>;

export type AuthedHttpMethodHandlerFunction<
  BodySchema extends Schema,
  ParamsSchema extends Schema,
  QuerySchema extends Schema
> = (
  context: AuthedContext<BodySchema, ParamsSchema, QuerySchema>
) => HttpMethodHandlerResponse | Promise<HttpMethodHandlerResponse>;
