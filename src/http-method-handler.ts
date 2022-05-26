import { HttpMethodHandlerFunction, AuthedHttpMethodHandlerFunction } from "./types";
import { SchemaValidation } from "./validation/schema";
import { Schema } from "./validation/types";

interface MethodHandlerSchemas<
  BodySchema extends Schema,
  ParamsSchema extends Schema,
  QuerySchema extends Schema
> {
  body?: BodySchema;
  params?: ParamsSchema;
  query?: QuerySchema;
}

export type MethodHandlerConfig<
  BodySchema extends Schema,
  ParamsSchema extends Schema,
  QuerySchema extends Schema
> =
  | {
      schemas?: MethodHandlerSchemas<BodySchema, ParamsSchema, QuerySchema>;
      useAuth: false;
      handlerFunction: HttpMethodHandlerFunction<BodySchema, ParamsSchema, QuerySchema>;
    }
  | {
      schemas?: MethodHandlerSchemas<BodySchema, ParamsSchema, QuerySchema>;
      useAuth: true;
      handlerFunction: AuthedHttpMethodHandlerFunction<BodySchema, ParamsSchema, QuerySchema>;
    };

export interface HandlerSchemaValidations {
  body?: SchemaValidation;
  params?: SchemaValidation;
  query?: SchemaValidation;
}

export type MethodHandler =
  | {
      schemas: HandlerSchemaValidations;
      useAuth: false;
      handlerFunction: HttpMethodHandlerFunction<any, any, any>;
    }
  | {
      schemas: HandlerSchemaValidations;
      useAuth: true;
      handlerFunction: AuthedHttpMethodHandlerFunction<any, any, any>;
    };
