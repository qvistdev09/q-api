"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentTypeJSON = exports.getEndpointsFromFiles = exports.createUrlMatcherFunction = exports.getNestedContents = void 0;
const fs_1 = __importDefault(require("fs"));
const consts_1 = require("../consts");
const javascriptFile = /\.js$/;
const indexRecursively = (basePath, pathsArray) => {
    const directoryContents = fs_1.default.readdirSync(basePath);
    directoryContents.forEach((content) => {
        const combinedPath = `${basePath}/${content}`;
        if (fs_1.default.statSync(combinedPath).isDirectory()) {
            indexRecursively(combinedPath, pathsArray);
        }
        else if (javascriptFile.test(combinedPath)) {
            pathsArray.push(combinedPath);
        }
    });
    return pathsArray;
};
const getNestedContents = (basePath) => indexRecursively(basePath, []);
exports.getNestedContents = getNestedContents;
const createUrlMatcherFunction = (basePath, filePath) => {
    const cleanedPath = filePath.replace(basePath, "").replace(/\.js$/, "");
    const urlParameters = cleanedPath.match(/{[a-zA-Z0-9]+}/g) || [];
    let urlRegexString = cleanedPath;
    urlParameters.forEach((parameter) => {
        const cleanedParam = parameter.replace(/[{}]/g, "");
        urlRegexString = urlRegexString.replace(parameter, `(?<${cleanedParam}>[A-Za-z0-9]+)`);
    });
    const matcherRegex = new RegExp(`^${urlRegexString}($|\\?.*)`);
    return (requestUrl) => {
        const matchResult = requestUrl.match(matcherRegex);
        if (matchResult === null) {
            return {
                match: false,
            };
        }
        return {
            match: true,
            params: matchResult.groups || {},
        };
    };
};
exports.createUrlMatcherFunction = createUrlMatcherFunction;
const getEndpointsFromFiles = (basePath) => {
    const endpoints = [];
    (0, exports.getNestedContents)(basePath).forEach((file) => {
        const routeConfig = require(file);
        const endpoint = {
            matcher: (0, exports.createUrlMatcherFunction)(basePath, file),
            methods: {},
        };
        consts_1.httpMethods.forEach((method) => {
            if (routeConfig[method]) {
                endpoint.methods[method] = routeConfig[method];
            }
        });
        endpoints.push(endpoint);
    });
    return endpoints;
};
exports.getEndpointsFromFiles = getEndpointsFromFiles;
const contentTypeJSON = (httpReq) => {
    if (httpReq.headers["content-type"] &&
        httpReq.headers["content-type"].toLowerCase() === "application/json") {
        return true;
    }
    return false;
};
exports.contentTypeJSON = contentTypeJSON;
//# sourceMappingURL=utils.js.map