import { BaseValidation } from "./base";
import { Nullable } from "./types";
export declare class BooleanValidation<T = boolean> extends BaseValidation<T> {
    constructor();
    nullable(): BooleanValidation<Nullable<boolean>>;
}
