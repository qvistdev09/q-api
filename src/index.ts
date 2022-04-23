import { createArrayValidator } from "./validation/array";
import { BooleanValidation } from "./validation/boolean";
import { NumberValidation } from "./validation/number";
import { SchemaValidation } from "./validation/schema";
import { StringValidation } from "./validation/string";

const person = {
  name: new StringValidation<string>(),
  age: createArrayValidator(new NumberValidation().greaterThan(30)).minLength(1),
  isCool: new BooleanValidation(),
  interests: {
    main: new StringValidation<string>().enum(["potato", "kimchi"]),
  },
};

const schemaThing = new SchemaValidation(person);

const testObject = {
  name: "Peter",
  age: ["50", 94],
  isCool: true,
  interests: {
    main: "potato",
  },
};

const result = schemaThing.validateObject(testObject, "body");

console.log(JSON.stringify(result, null, 2));
