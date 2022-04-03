import http from "http";
import { Endpoint, UrlMatcherResult } from "./types";
export declare const getNestedContents: (basePath: string) => string[];
export declare const createUrlMatcherFunction: (basePath: string, filePath: string) => (requestUrl: string) => UrlMatcherResult;
export declare const getEndpointsFromFiles: (basePath: string) => Endpoint[];
export declare const contentTypeJSON: (httpReq: http.IncomingMessage) => boolean;
