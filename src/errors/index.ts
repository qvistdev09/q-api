import { ValidationError } from "../validation/types";
import { ErrorHandler } from "./types";

export class ApiError {
  statusCode: number;
  message: string;
  data: any | null;
  constructor(statusCode: number, message: string, data?: any) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data || null;
  }
}

export const defaultErrorHandler: ErrorHandler = (req, res, err) => {
  console.log(err);
  if (err instanceof ApiError) {
    res.httpRes.writeHead(err.statusCode, { "Content-Type": "application/json" });
    const errorResponse = { error: err.message, ...(err.data ? { data: err.data } : {}) };
    res.httpRes.end(JSON.stringify(errorResponse));
    return;
  }
  res.httpRes.writeHead(500, { "Content-Type": "application/json" });
  res.httpRes.end(JSON.stringify({ error: "Internal server error" }));
  return;
};

export const createError = {
  badRequest: (message: string) => new ApiError(400, message),
  unauthorized: (message: string) => new ApiError(401, message),
  forbidden: (message: string) => new ApiError(403, message),
  notFound: (message: string) => new ApiError(404, message),
  methodNotAllowed: (message: string) => new ApiError(405, message),
  validationError: (message: string, errors: ValidationError[]) =>
    new ApiError(400, message, errors),
};
