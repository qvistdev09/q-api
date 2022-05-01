import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import { DecodedUser } from "./auth";
import { Schema, SchemaDerivedInterface } from "./validation/types";

export class Context<BodySchema = Schema, PathSchema = Schema, QuerySchema = Schema> {
  httpRes: ServerResponse;
  httpReq: IncomingMessage;
  body: SchemaDerivedInterface<BodySchema>;
  params: SchemaDerivedInterface<PathSchema>;
  query: SchemaDerivedInterface<QuerySchema>;
  headers: IncomingHttpHeaders;

  constructor(httpReq: IncomingMessage, httpRes: ServerResponse) {
    this.httpReq = httpReq;
    this.httpRes = httpRes;
    this.headers = httpReq.headers;
    this.body = {} as SchemaDerivedInterface<BodySchema>;
    this.params = {} as SchemaDerivedInterface<PathSchema>;
    this.query = {} as SchemaDerivedInterface<QuerySchema>;
  }
}

export class AuthedContext<BodySchema, PathSchema, QuerySchema> extends Context<
  BodySchema,
  PathSchema,
  QuerySchema
> {
  user: DecodedUser;
  constructor(httpReq: IncomingMessage, httpRes: ServerResponse) {
    super(httpReq, httpRes);
    this.user = {} as DecodedUser;
  }
}
