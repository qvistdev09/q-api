import { createArrayValidator } from "./array";
import { NumberValidation } from "./number";
import { StringValidation } from "./string";
import { SchemaDerivedInterface } from "./types";

const person = {
  name: new StringValidation().enum(["hey", "tjo"] as const),
  favoriteNumbers: createArrayValidator(new StringValidation<string>().enum(["hey"] as const)),
};

type TestType = SchemaDerivedInterface<typeof person>;
