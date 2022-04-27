import { Context } from "./context";
import { Schema } from "./validation/types";

export class MethodHandler<BodySchema, QuerySchema, PathSchema> {
  handlerMethod: ((context: Context<BodySchema, QuerySchema, PathSchema>) => void) | null;

  constructor() {
    this.handlerMethod = null;
  }

  defineHandler(method: (context: Context<BodySchema, QuerySchema, PathSchema>) => void) {
    this.handlerMethod = method;
  }
}

export const createHandler = <BodySchema = Schema, QuerySchema = Schema, PathSchema = Schema>({
  bodyValidation,
  queryValidation,
  pathValidation,
}: {
  bodyValidation?: BodySchema;
  queryValidation?: QuerySchema;
  pathValidation?: PathSchema;
}) => {
  return new MethodHandler<BodySchema, QuerySchema, PathSchema>();
};
