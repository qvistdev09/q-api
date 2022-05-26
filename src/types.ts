import { AuthedContext, Context } from "./context";
import { Schema } from "./validation/types";

type JSONValues = number | string | boolean | null;

export interface JSON {
  [key: string]: JSONValues | JSON | Array<JSONValues | JSON>;
}

export interface HttpMethodHandlerResponse {
  data: JSON;
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
