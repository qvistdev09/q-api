import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import { DecodedUser } from "./auth";
import { Schema, SchemaDerivedInterface } from "./validation/types";

export class Context<
  BodySchema extends Schema = any,
  ParamsSchema extends Schema = any,
  QuerySchema extends Schema = any
> {
  body: SchemaDerivedInterface<BodySchema>;
  params: SchemaDerivedInterface<ParamsSchema>;
  query: SchemaDerivedInterface<QuerySchema>;
  headers: IncomingHttpHeaders;

  constructor(public req: IncomingMessage, public res: ServerResponse) {
    this.body = {} as SchemaDerivedInterface<BodySchema>;
    this.params = {} as SchemaDerivedInterface<ParamsSchema>;
    this.query = {} as SchemaDerivedInterface<QuerySchema>;
    this.headers = req.headers;
  }
}

export class AuthedContext<
  BodySchema extends Schema = any,
  ParamsSchema extends Schema = any,
  QuerySchema extends Schema = any
> extends Context<BodySchema, ParamsSchema, QuerySchema> {
  constructor(req: IncomingMessage, res: ServerResponse, public user: DecodedUser) {
    super(req, res);
  }
}
