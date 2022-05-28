import { Service } from "./api";
import { BaseEndpoint } from "./base-endpoint";
export declare const getFilePaths: (baseDirectory: string, filePaths?: string[]) => string[];
export declare const createUrlMatcherFunction: (basePath: string, filePath: string) => (requestUrl: string) => UrlMatcherResult;
export declare const importEndpoints: (baseFolder: string, services: Service[]) => BaseEndpoint[];
export interface UrlMatcherResult {
    match: boolean;
    params?: Record<string, string>;
}
