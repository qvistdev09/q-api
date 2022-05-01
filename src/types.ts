import { Context } from "./context";

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
) => HttpMethodHandlerResponse;
