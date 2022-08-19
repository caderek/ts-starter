import { suite, assert } from "./util/test.js";
import hello from "./index.js";

const test = suite("Index");

test("Works", () => {
  assert.equal(hello, "Hello World!");
});

test.run();
