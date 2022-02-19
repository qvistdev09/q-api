import { ErrorHandler } from "./types";

class ApiError {
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
    res.httpRes.end(JSON.stringify({ error: err.message }));
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
};
