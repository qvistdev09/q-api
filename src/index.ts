import { Api, ApiConfig } from "./api";
import { BaseEndpoint } from "./base-endpoint";
import { createError } from "./errors";
import { ArrayValidation } from "./validation/array";
import { BaseValidation } from "./validation/base";
import { BooleanValidation } from "./validation/boolean";
import { NumberValidation } from "./validation/number";
import { StringValidation } from "./validation/string";
import { loadEnv } from "./load-env";

export const createApi = (apiConfig: ApiConfig) => new Api(apiConfig);
export const number = () => new NumberValidation<number>();
export const string = () => new StringValidation<string>();
export const boolean = () => new BooleanValidation<boolean>();
export const array = <t>(element: BaseValidation<t>) => new ArrayValidation(element);
export { BaseEndpoint, createError, loadEnv };
