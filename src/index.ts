import { Api, AuthConfig } from "./api";
import { BaseEndpoint } from "./base-endpoint";
import { ArrayValidation } from "./validation/array";
import { BaseValidation } from "./validation/base";
import { BooleanValidation } from "./validation/boolean";
import { NumberValidation } from "./validation/number";
import { StringValidation } from "./validation/string";

const Q = {
  createApi: (authConfig: AuthConfig) => new Api(authConfig),
  BaseEndpoint,
  val: {
    number: () => new NumberValidation<number>(),
    string: () => new StringValidation<string>(),
    boolean: () => new BooleanValidation<boolean>(),
    array: <t>(element: BaseValidation<t>) => new ArrayValidation(element),
  },
};

export default Q;
