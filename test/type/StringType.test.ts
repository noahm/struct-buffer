import it from "ava";
import {
  string_t,
  StructBuffer,
  sbytes2 as b2,
  sview,
} from "../../src/index.js";

it("test decode and encode", (t) => {
  let struct = new StructBuffer({
    a: string_t,
    b: string_t,
    c: string_t[2],
  });
  const obj = {
    a: "a",
    b: "b",
    c: "cd",
  };
  const view = b2("abcd");
  t.deepEqual(struct.decode(view), obj);

  t.is(sview(struct.encode(obj)), sview(view));

  t.is(struct.byteLength, 4);
});

it("test names", (t) => {
  const type = string_t[3][4];
  const obj = ["abcd", "abce", "abcf"] as any;

  const view = type.encode(obj);

  const names = type.decode(view);

  t.deepEqual(names, obj);
});
