import { Base } from "./base";

export class BooleanValidation extends Base<boolean> {
  constructor() {
    super();
    this.validatorFunctions.push((path, value, errors, dataSource, setTransformedValue) => {
      if (dataSource === "body" && typeof value === "boolean") {
        return;
      }
      if (dataSource === "body" && typeof value !== "boolean") {
        errors.push({
          path,
          error: "Value is not boolean",
        });
        return;
      }
      if (value === "true") {
        setTransformedValue(true);
        return;
      }
      if (value === "false") {
        setTransformedValue(false);
        return;
      }
      errors.push({
        path,
        error: "Value must be a string that is parseable as boolean, i.e. 'true' or 'false'",
      });
    });
  }
}
