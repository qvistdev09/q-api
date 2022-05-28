import { DataSource, ObjectValidationResult, PairedValidator, Schema } from "./types";
export declare class SchemaValidation {
    propertyValidators: PairedValidator[];
    allowedProperties: string[];
    schema: Schema;
    constructor(schema: Schema);
    validateObject(object: any, source: DataSource): ObjectValidationResult;
}
