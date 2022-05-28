/// <reference types="node" />
import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import { DecodedUser } from "./auth";
import { Schema, SchemaDerivedInterface } from "./validation/types";
export declare class Context<BodySchema extends Schema = any, ParamsSchema extends Schema = any, QuerySchema extends Schema = any> {
    req: IncomingMessage;
    res: ServerResponse;
    body: SchemaDerivedInterface<BodySchema>;
    params: SchemaDerivedInterface<ParamsSchema>;
    query: SchemaDerivedInterface<QuerySchema>;
    headers: IncomingHttpHeaders;
    constructor(req: IncomingMessage, res: ServerResponse);
}
export declare class AuthedContext<BodySchema extends Schema = any, ParamsSchema extends Schema = any, QuerySchema extends Schema = any> extends Context<BodySchema, ParamsSchema, QuerySchema> {
    user: DecodedUser;
    constructor(context: Context, user: DecodedUser);
}
