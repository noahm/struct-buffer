import test from "ava";
import {
  char,
  StructBuffer,
  uchar,
  pack,
  sview,
  sbytes2 as b2,
} from "../../src/index.js";

test("test decode and encode", (t) => {
  const view = b2("abcd");
  const obj = {
    a: 0x61,
    b: [0x62],
    c: [0x63, 0x64],
  };
  let struct = new StructBuffer({
    a: char,
    b: char[1],
    c: char[2],
  });
  t.deepEqual(struct.decode(view), obj);
  t.is(sview(struct.encode(obj)), sview(view));
  t.is(struct.byteLength, 4);
});

test("test char and uchar", (t) => {
  const s = new StructBuffer({
    a: char,
    b: uchar,
  });
  const data = s.decode(pack("bb", -1, -1));
  t.deepEqual(data, {
    a: -1,
    b: 255,
  });
});
