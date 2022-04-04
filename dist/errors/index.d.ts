import { ValidationError } from "../validation/types";
import { ErrorHandler } from "./types";
export declare class ApiError {
    statusCode: number;
    message: string;
    data: any | null;
    constructor(statusCode: number, message: string, data?: any);
}
export declare const defaultErrorHandler: ErrorHandler;
export declare const createError: {
    badRequest: (message: string) => ApiError;
    unauthorized: (message: string) => ApiError;
    forbidden: (message: string) => ApiError;
    notFound: (message: string) => ApiError;
    methodNotAllowed: (message: string) => ApiError;
    validationError: (message: string, errors: ValidationError[]) => ApiError;
};
