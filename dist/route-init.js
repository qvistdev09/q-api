"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importEndpoints = exports.createUrlMatcherFunction = exports.getFilePaths = void 0;
const fs_1 = __importDefault(require("fs"));
const base_endpoint_1 = require("./base-endpoint");
const javascriptFile = /\.js$/;
const getFilePaths = (baseDirectory, filePaths = []) => {
    const directoryContents = fs_1.default.readdirSync(baseDirectory);
    directoryContents.forEach((content) => {
        const combinedPath = `${baseDirectory}/${content}`;
        if (fs_1.default.statSync(combinedPath).isDirectory()) {
            (0, exports.getFilePaths)(combinedPath, filePaths);
        }
        else if (javascriptFile.test(combinedPath)) {
            filePaths.push(combinedPath);
        }
    });
    return filePaths;
};
exports.getFilePaths = getFilePaths;
const createUrlMatcherFunction = (basePath, filePath) => {
    var _a;
    const cleanedPath = filePath.replace(basePath, "").replace(/\.js$/, "");
    const urlParameters = (_a = cleanedPath.match(/{.+}/g)) !== null && _a !== void 0 ? _a : [];
    let urlRegexString = cleanedPath;
    urlParameters.forEach((parameter) => {
        const cleanedParam = parameter.replace(/[{}]/g, "");
        urlRegexString = urlRegexString.replace(parameter, `(?<${cleanedParam}>[A-Za-z0-9]+)`);
    });
    const matcherRegex = new RegExp(`^${urlRegexString}($|\\?.*)`);
    return (requestUrl) => {
        var _a;
        const matchResult = requestUrl.match(matcherRegex);
        if (matchResult === null) {
            return {
                match: false,
            };
        }
        return {
            match: true,
            params: (_a = matchResult.groups) !== null && _a !== void 0 ? _a : {},
        };
    };
};
exports.createUrlMatcherFunction = createUrlMatcherFunction;
const importEndpoints = (baseFolder, services) => {
    const endpoints = [];
    (0, exports.getFilePaths)(baseFolder).forEach((filePath) => {
        var _a;
        const { Endpoint } = require(filePath);
        const requestedServicesNames = ((_a = Endpoint.services) !== null && _a !== void 0 ? _a : []);
        const matchedServices = requestedServicesNames.map((name) => {
            const matchedService = services.find((service) => service.name === name);
            if (matchedService) {
                return matchedService.reference;
            }
            throw new Error(`Undefined service: ${name}`);
        });
        const endpoint = new Endpoint(...matchedServices);
        if (endpoint instanceof base_endpoint_1.BaseEndpoint) {
            endpoint.urlMatcher = (0, exports.createUrlMatcherFunction)(baseFolder, filePath);
            endpoints.push(endpoint);
        }
    });
    return endpoints;
};
exports.importEndpoints = importEndpoints;
//# sourceMappingURL=route-init.js.map