import { AuthedContext, Context } from "./context";

type JSONValues = number | string | boolean | null;

export interface JSON {
  [key: string]: JSONValues | JSON | Array<JSONValues | JSON>;
}

export interface HttpMethodHandlerResponse {
  data: JSON;
  statusCode: number;
}

export type HttpMethodHandlerFunction<b, p, q> = (
  context: Context<b, p, q>
) => HttpMethodHandlerResponse | Promise<HttpMethodHandlerResponse>;

export type AuthedHttpMethodHandlerFunction<b, p, q> = (
  context: AuthedContext<b, p, q>
) => HttpMethodHandlerResponse | Promise<HttpMethodHandlerResponse>;
