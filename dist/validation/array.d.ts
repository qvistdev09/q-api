import { BaseValidation } from "./base";
import { Nullable } from "./types";
export declare class ArrayValidation<T> extends BaseValidation<Array<T>> {
    validator: BaseValidation<T>;
    constructor(validator: BaseValidation<T>);
    nullable(): ArrayValidation<Nullable<T>>;
    minLength(min: number): this;
    maxLength(max: number): this;
}
