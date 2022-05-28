import { PairedValidator, Schema } from "./types";
export declare const getValidatorsRecursively: (schema: Schema, paths?: string[], validators?: PairedValidator[]) => PairedValidator[];
export declare const indexObjectProperties: (object: any, paths?: string[], properties?: string[]) => string[];
export declare const getValueViaDotNotation: (path: string, data: any) => any;
export declare const setValueViaDotNotation: (path: string, data: any, value: any) => void;
