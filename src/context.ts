import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import { DecodedUser } from "./auth/types";
import { JSON } from "./types";
import { SchemaDerivedInterface } from "./validation/types";

export class Context<BodySchema, PathSchema, QuerySchema> {
  httpRes: ServerResponse;
  httpReq: IncomingMessage;
  body: SchemaDerivedInterface<BodySchema>;
  query: SchemaDerivedInterface<QuerySchema>;
  params: SchemaDerivedInterface<PathSchema>;
  headers: IncomingHttpHeaders;
  user?: DecodedUser;
  responseData: JSON;
  statusCode: number | null;

  constructor(httpReq: IncomingMessage, httpRes: ServerResponse) {
    this.httpReq = httpReq;
    this.httpRes = httpRes;
    this.responseData = {};
    this.statusCode = null;
    this.headers = httpReq.headers;
    this.body = {} as SchemaDerivedInterface<BodySchema>;
    this.params = {} as SchemaDerivedInterface<PathSchema>;
    this.query = {} as SchemaDerivedInterface<QuerySchema>;
  }
}
