import { HttpMethodHandler } from "./http-method-handler";

export class BaseEndpoint {
  createHandler() {
    return new HttpMethodHandler();
  }
}
