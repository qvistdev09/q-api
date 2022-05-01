import { HttpMethodHandler } from "./http-method-handler";

export class BaseEndpoint {
  public static services: string[];
  createHandler() {
    return new HttpMethodHandler();
  }
}
