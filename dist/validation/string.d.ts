import { BaseValidation } from "./base";
import { Nullable } from "./types";
export declare class StringValidation<T = string> extends BaseValidation<T> {
    constructor();
    nullable(): StringValidation<Nullable<T>>;
    maxLength(limit: number): this;
    minLength(minCharacters: number): this;
    enum<e = string>(accepted: Readonly<e[]>): StringValidation<e>;
    regex(regex: RegExp, onError: string): this;
}
