"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaVal = exports.ArrayVal = exports.BooleanVal = exports.NumberVal = exports.StringVal = exports.BaseVal = void 0;
const isObject = (value) => {
    return typeof value === "object" && !Array.isArray(value) && value !== null;
};
const getValueViaDotNotation = (path, data) => {
    return path.split(".").reduce((object, accessor) => {
        if (object === undefined || object === null) {
            return null;
        }
        return object[accessor];
    }, data);
};
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
class BaseVal {
    constructor() {
        this.tests = [];
        this.transformedValue = null;
    }
    evaluate(objectToValidate, returnObject, path, errors, source) {
        const value = getValueViaDotNotation(path, objectToValidate);
        this.tests.forEach((validator) => {
            validator(path, value, errors, source, (transformed) => {
                this.transformedValue = transformed;
            });
        });
        setValueViaDotNotation(path, returnObject, this.transformedValue || value);
    }
}
exports.BaseVal = BaseVal;
class StringVal extends BaseVal {
    constructor() {
        super();
        this.tests.push((path, value, errors) => {
            if (typeof value !== "string") {
                errors.push({
                    path,
                    error: "Value is not of type string",
                });
            }
        });
    }
    maxLength(limit) {
        this.tests.push((path, value, errors) => {
            if (typeof value === "string" && value.length > limit) {
                errors.push({
                    path,
                    error: `String cannot be longer than ${limit} characters`,
                });
            }
        });
        return this;
    }
    minLength(minCharacters) {
        this.tests.push((path, value, errors) => {
            if (typeof value === "string" && value.length < minCharacters) {
                errors.push({
                    path,
                    error: `String must be at least ${minCharacters} characters`,
                });
            }
        });
        return this;
    }
    enum(accepted) {
        this.tests.push((path, value, errors) => {
            if (!accepted.includes(value)) {
                errors.push({
                    path,
                    error: `String must be one of [${accepted.join(" | ")}]`,
                });
            }
        });
        return this;
    }
    regex(regex, onError) {
        this.tests.push((path, value, errors) => {
            if (!regex.test(value)) {
                errors.push({
                    path,
                    error: onError,
                });
            }
        });
        return this;
    }
}
exports.StringVal = StringVal;
const integerRegex = /^[1-9][0-9]*$|^0$/;
const numberRegex = /(^[1-9][0-9]*$|^0$)|(^(0|[1-9][0-9]*)\.\d+$)/;
class NumberVal extends BaseVal {
    constructor() {
        super();
        this.tests.push((path, value, errors, source, setTransformedValue) => {
            if (source === "body") {
                if (typeof value !== "number") {
                    errors.push({
                        path,
                        error: "Value is not of type number",
                    });
                }
            }
            else {
                if (typeof value !== "string" || !numberRegex.test(value)) {
                    errors.push({
                        path,
                        error: "String must be parseable as number",
                    });
                }
                else {
                    setTransformedValue(Number.parseFloat(value));
                }
            }
        });
    }
    integer() {
        this.tests.push((path, value, errors, source, setTransformedValue) => {
            if (source === "body") {
                if (!Number.isInteger(value)) {
                    errors.push({
                        path,
                        error: "Value is not integer",
                    });
                }
            }
            else {
                if (typeof value !== "string" || !integerRegex.test(value)) {
                    errors.push({
                        path,
                        error: "Value must be a string that can be parsed to an integer",
                    });
                }
                else {
                    setTransformedValue(Number.parseInt(value, 10));
                }
            }
        });
        return this;
    }
    lesserThan(threshold) {
        this.tests.push((path, value, errors, source) => {
            const valueToCheck = source === "body" ? value : this.transformedValue;
            if (typeof valueToCheck === "number" && valueToCheck >= threshold) {
                errors.push({
                    path,
                    error: `Value cannot be greater than ${threshold}`,
                });
            }
        });
        return this;
    }
    greaterThan(minimum) {
        this.tests.push((path, value, errors, source) => {
            const valueToCheck = source === "body" ? value : this.transformedValue;
            if (typeof valueToCheck === "number" && valueToCheck <= minimum) {
                errors.push({
                    path,
                    error: `Value must be greater than ${minimum}`,
                });
            }
        });
        return this;
    }
}
exports.NumberVal = NumberVal;
class BooleanVal extends BaseVal {
    constructor() {
        super();
        this.tests.push((path, value, errors, source, setTransformedValue) => {
            if (source === "body" && typeof value !== "boolean") {
                errors.push({
                    path,
                    error: "Value is not boolean",
                });
                return this;
            }
            if (value === "true") {
                setTransformedValue(true);
                return this;
            }
            if (value === "false") {
                setTransformedValue(false);
                return this;
            }
            errors.push({
                path,
                error: "Value must be a string that is parseable as boolean, i.e. 'true' or 'false'",
            });
        });
    }
}
exports.BooleanVal = BooleanVal;
class ArrayVal extends BaseVal {
    constructor(validator) {
        super();
        this.tests.push((path, value, errors) => {
            if (!Array.isArray(value)) {
                errors.push({
                    path,
                    error: "Value is not an array",
                });
                return;
            }
            value.forEach((element, index) => {
                const validationSetup = { data: element };
                const elementErrors = [];
                validator.evaluate(validationSetup, {}, "data", elementErrors, "body");
                elementErrors.forEach((elementError) => {
                    errors.push({
                        path: `${path}[${index}]`,
                        error: elementError.error,
                    });
                });
            });
            return;
        });
    }
    minLength(min) {
        this.tests.push((path, value, errors) => {
            if (Array.isArray(value) && value.length < min) {
                errors.push({
                    path,
                    error: `Array must have a length that is ${min} minimum`,
                });
            }
        });
        return this;
    }
    maxLength(max) {
        this.tests.push((path, value, errors) => {
            if (Array.isArray(value) && value.length > max) {
                errors.push({
                    path,
                    error: `Array must have a length that is ${max} maximum`,
                });
            }
        });
        return this;
    }
}
exports.ArrayVal = ArrayVal;
const getValidatorsRecursively = (schema, paths = [], validators = []) => {
    const keys = Object.keys(schema);
    keys.forEach((key) => {
        const nextValue = schema[key];
        if (nextValue instanceof BaseVal) {
            validators.push({
                path: [...paths, key].join("."),
                validator: nextValue,
            });
        }
        else {
            const nextLevel = schema[key];
            if (nextLevel && !(nextLevel instanceof BaseVal)) {
                paths.push(key);
                getValidatorsRecursively(nextLevel, paths, validators);
            }
        }
    });
    return validators;
};
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
            paths.push(key);
            indexObjectProperties(object[key], paths, properties);
        }
    });
    return properties;
};
class SchemaVal {
    constructor(schema) {
        const validatorsMap = {};
        const pairedValidators = getValidatorsRecursively(schema);
        pairedValidators.forEach((pairedValidator) => {
            validatorsMap[pairedValidator.path] = pairedValidator;
        });
        this.validatorsMap = validatorsMap;
        this.allowedProperties = pairedValidators.map((pairedValidator) => pairedValidator.path);
    }
    validateObject(object, requireAllKeys, source) {
        const errors = [];
        const returnObject = {};
        const objectProperties = indexObjectProperties(object);
        objectProperties.forEach((property) => {
            if (!this.allowedProperties.includes(property)) {
                errors.push({
                    path: property,
                    error: "Non-allowed property",
                });
            }
        });
        const propertiesToValidate = requireAllKeys
            ? this.allowedProperties
            : objectProperties.filter((property) => this.allowedProperties.includes(property));
        propertiesToValidate.forEach((property) => {
            const validator = this.validatorsMap[property];
            if (validator) {
                validator.validator.evaluate(object, returnObject, validator.path, errors, source);
            }
        });
        return {
            object: returnObject,
            errors,
        };
    }
}
exports.SchemaVal = SchemaVal;
//# sourceMappingURL=index.js.map