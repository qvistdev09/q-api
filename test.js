const { getNestedContents } = require("./dist/features/routing/index");

const contents = getNestedContents("./src");

console.log(contents);
