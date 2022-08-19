import { suite, assert } from "./util/test.js";

const test = suite("Index");

test("Works", () => {
  assert.equal(1, 1);
});

test.run();
