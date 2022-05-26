import {
  HandlerSchemaValidations,
  MethodHandler,
  MethodHandlerConfig,
} from "./http-method-handler";
import { UrlMatcherResult } from "./route-init";
import { SchemaValidation } from "./validation/schema";
import { Schema } from "./validation/types";

export class BaseEndpoint {
  public static services: string[];

  GET?: MethodHandler;
  POST?: MethodHandler;
  PUT?: MethodHandler;
  PATCH?: MethodHandler;
  DELETE?: MethodHandler;

  urlMatcher?: (url: string) => UrlMatcherResult;

  createMethodHandler<
    BodySchema extends Schema,
    ParamsSchema extends Schema,
    QuerySchema extends Schema
  >(handlerConfig: MethodHandlerConfig<BodySchema, ParamsSchema, QuerySchema>): MethodHandler {
    const schemaValidations: HandlerSchemaValidations = {};
    if (handlerConfig.schemas) {
      const { body, params, query } = handlerConfig.schemas;
      if (body) {
        schemaValidations.body = new SchemaValidation(body);
      }
      if (params) {
        schemaValidations.params = new SchemaValidation(params);
      }
      if (query) {
        schemaValidations.query = new SchemaValidation(query);
      }
    }
    return { ...handlerConfig, schemas: schemaValidations };
  }
}
