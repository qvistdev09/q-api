import { AuthedContext, Context } from "./context";

type JSONValues = number | string | boolean | null;

export interface JSON {
  [key: string]: JSONValues | JSON | Array<JSONValues | JSON>;
}

export interface HttpMethodHandlerResponse {
  data: JSON;
  statusCode: number;
}

export type HttpMethodHandlerFunction<BodySchema, PathSchema, QuerySchema> = (
  context: Context<BodySchema, PathSchema, QuerySchema>
) => HttpMethodHandlerResponse | Promise<HttpMethodHandlerResponse>;

export type AuthedHttpMethodHandlerFunction<BodySchema, PathSchema, QuerySchema> = (
  context: AuthedContext<BodySchema, PathSchema, QuerySchema>
) => HttpMethodHandlerResponse | Promise<HttpMethodHandlerResponse>;
