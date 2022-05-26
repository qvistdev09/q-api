import { Api, AuthConfig } from "./api";
import { BaseEndpoint } from "./base-endpoint";
import { ArrayValidation } from "./validation/array";
import { BaseValidation } from "./validation/base";
import { BooleanValidation } from "./validation/boolean";
import { NumberValidation } from "./validation/number";
import { StringValidation } from "./validation/string";

export const createApi = (authConfig: AuthConfig) => new Api(authConfig);
export const number = () => new NumberValidation<number>();
export const string = () => new StringValidation<string>();
export const boolean = () => new BooleanValidation<boolean>();
export const array = <t>(element: BaseValidation<t>) => new ArrayValidation(element);
export { BaseEndpoint };
