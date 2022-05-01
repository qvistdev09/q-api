import { HttpMethodHandler, AuthedHttpMethodHandler } from "./http-method-handler";
import { UrlMatcherResult } from "./route-init";

export class BaseEndpoint {
  public static services: string[];

  GET?: HttpMethodHandler | AuthedHttpMethodHandler;

  urlMatcher?: (url: string) => UrlMatcherResult;

  createHandler() {
    return new HttpMethodHandler();
  }
}
