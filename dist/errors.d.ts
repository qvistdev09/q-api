import { AuthedContext, Context } from "./context";
export interface ValidationError {
    path: string;
    issue: string;
}
export declare type ErrorHandler = (context: Context | AuthedContext, err: any) => void;
export declare class ApiError {
    statusCode: number;
    message: string;
    data: any | null;
    constructor(statusCode: number, message: string, data?: any);
}
export declare const defaultErrorHandler: ErrorHandler;
export declare const createError: {
    generic: (message: string, statusCode: number) => ApiError;
    badRequest: (message: string) => ApiError;
    unauthorized: (message: string) => ApiError;
    forbidden: (message: string) => ApiError;
    notFound: (message: string) => ApiError;
    methodNotAllowed: (message: string) => ApiError;
    validationError: (message: string, errors: ValidationError[]) => ApiError;
};
