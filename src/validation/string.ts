import { BaseValidation } from "./base";

export class StringValidation<t = string> extends BaseValidation<t> {
  constructor() {
    super();
    this.validatorFunctions.push((validationContainer) => {
      if (typeof validationContainer.originalValue !== "string") {
        validationContainer.errors.push("Value is not of type string");
      }
    });
  }

  maxLength(limit: number) {
    this.validatorFunctions.push((validationContainer) => {
      const { originalValue } = validationContainer;
      if (typeof originalValue === "string" && originalValue.length > limit) {
        validationContainer.errors.push(`String cannot be longer than ${limit} characters`);
      }
    });
    return this;
  }

  minLength(minCharacters: number) {
    this.validatorFunctions.push((validationContainer) => {
      const { originalValue } = validationContainer;
      if (typeof originalValue === "string" && originalValue.length < minCharacters) {
        validationContainer.errors.push(`String must be at least ${minCharacters} characters`);
      }
    });
    return this;
  }

  enum<e = string>(accepted: Readonly<e[]>) {
    this.validatorFunctions.push((validationContainer) => {
      const { originalValue } = validationContainer;
      if (!accepted.includes(originalValue)) {
        validationContainer.errors.push(`String must be one of [${accepted.join(" | ")}]`);
      }
    });
    const typeChangedInstance = new StringValidation<e>();
    typeChangedInstance.validatorFunctions = this.validatorFunctions;
    return typeChangedInstance;
  }

  regex(regex: RegExp, onError: string) {
    this.validatorFunctions.push((validationContainer) => {
      if (!regex.test(validationContainer.originalValue)) {
        validationContainer.errors.push(onError);
      }
    });
    return this;
  }
}
