import { Base } from "./base";

export class String<t = string> extends Base<t> {
  constructor() {
    super();
    this.validatorFunctions.push((path, value, errors) => {
      if (typeof value !== "string") {
        errors.push({
          path,
          error: "Value is not of type string",
        });
      }
    });
  }

  maxLength(limit: number) {
    this.validatorFunctions.push((path, value, errors) => {
      if (typeof value === "string" && value.length > limit) {
        errors.push({
          path,
          error: `String cannot be longer than ${limit} characters`,
        });
      }
    });
    return this;
  }

  minLength(minCharacters: number) {
    this.validatorFunctions.push((path, value, errors) => {
      if (typeof value === "string" && value.length < minCharacters) {
        errors.push({
          path,
          error: `String must be at least ${minCharacters} characters`,
        });
      }
    });
    return this;
  }

  enum<p = string>(accepted: Readonly<p[]>) {
    this.validatorFunctions.push((path, value, errors) => {
      if (!accepted.includes(value)) {
        errors.push({
          path,
          error: `String must be one of [${accepted.join(" | ")}]`,
        });
      }
    });

    const typeChangedInstance = new String<p>();
    typeChangedInstance.validatorFunctions = this.validatorFunctions;
    return typeChangedInstance;
  }

  regex(regex: RegExp, onError: string) {
    this.validatorFunctions.push((path, value, errors) => {
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
