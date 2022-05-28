"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setValueViaDotNotation = exports.getValueViaDotNotation = exports.indexObjectProperties = exports.getValidatorsRecursively = void 0;
const base_1 = require("./base");
const isObject = (value) => {
    return typeof value === "object" && !Array.isArray(value) && value !== null;
};
const getValidatorsRecursively = (schema, paths = [], validators = []) => {
    const keys = Object.keys(schema);
    keys.forEach((key) => {
        const next = schema[key];
        if (next instanceof base_1.BaseValidation) {
            validators.push({
                path: [...paths, key].join("."),
                validator: next,
            });
        }
        else if (next) {
            const branchedPath = [...paths, key];
            (0, exports.getValidatorsRecursively)(next, branchedPath, validators);
        }
    });
    return validators;
};
exports.getValidatorsRecursively = getValidatorsRecursively;
const indexObjectProperties = (object, paths = [], properties = []) => {
    if (!isObject(object)) {
        return properties;
    }
    Object.keys(object).forEach((key) => {
        const nextValue = object[key];
        if (!isObject(nextValue)) {
            properties.push([...paths, key].join("."));
        }
        else {
            const newPaths = [...paths, key];
            (0, exports.indexObjectProperties)(object[key], newPaths, properties);
        }
    });
    return properties;
};
exports.indexObjectProperties = indexObjectProperties;
const getValueViaDotNotation = (path, data) => {
    return path.split(".").reduce((object, accessor) => {
        if (object === undefined || object === null) {
            return null;
        }
        return object[accessor];
    }, data);
};
exports.getValueViaDotNotation = getValueViaDotNotation;
const setValueViaDotNotation = (path, data, value) => {
    let currentLevel = data;
    path.split(".").forEach((accessor, index, array) => {
        if (index === array.length - 1) {
            currentLevel[accessor] = value;
        }
        else {
            if (isObject(currentLevel[accessor])) {
                currentLevel = currentLevel[accessor];
            }
            else {
                currentLevel[accessor] = {};
                currentLevel = currentLevel[accessor];
            }
        }
    });
};
exports.setValueViaDotNotation = setValueViaDotNotation;
//# sourceMappingURL=utils.js.map