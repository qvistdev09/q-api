import { HttpMethodHandler } from "./http-method-handler";
import { UrlMatcherResult } from "./route-init";

export class BaseEndpoint {
  public static services: string[];
  urlMatcher?: (url: string) => UrlMatcherResult;
  createHandler() {
    return new HttpMethodHandler();
  }
}
