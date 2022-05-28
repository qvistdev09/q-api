import { BaseValidation } from "./base";
import { Nullable } from "./types";
export declare class NumberValidation<T = number> extends BaseValidation<T> {
    constructor();
    nullable(): NumberValidation<Nullable<number>>;
    integer(): this;
    max(threshold: number): this;
    min(minimum: number): this;
}
