import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import { DecodedUser } from "./auth";
import { Schema, SchemaDerivedInterface } from "./validation/types";

export class Context<b = Schema, p = Schema, q = Schema> {
  req: IncomingMessage;
  res: ServerResponse;
  body: SchemaDerivedInterface<b>;
  params: SchemaDerivedInterface<p>;
  query: SchemaDerivedInterface<q>;
  headers: IncomingHttpHeaders;

  constructor(req: IncomingMessage, res: ServerResponse) {
    this.req = req;
    this.res = res;
    this.body = {} as SchemaDerivedInterface<b>;
    this.params = {} as SchemaDerivedInterface<p>;
    this.query = {} as SchemaDerivedInterface<q>;
    this.headers = req.headers;
  }
}

export class AuthedContext<b = Schema, p = Schema, q = Schema> extends Context<b, p, q> {
  user: DecodedUser;
  constructor(req: IncomingMessage, res: ServerResponse, user: DecodedUser) {
    super(req, res);
    this.user = user;
  }
}
