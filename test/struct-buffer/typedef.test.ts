import test from "ava";
import { uint32_t, typedef } from "../../src/index.js";

test("test typedef", (t) => {
  const HANDLE = typedef(uint32_t);
  t.is(HANDLE.size, 4);
  t.is(HANDLE.unsigned, true);
});
