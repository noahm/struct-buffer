import test from "ava";
import { StructBuffer, sview, uint16_t } from "../src/index.js";

// https://github.com/januwA/struct-buffer/issues/2

test("string_t", (t) => {
  const s = new StructBuffer({
    a: uint16_t,
    b: uint16_t,
    c: new StructBuffer({
      ip: uint16_t,
      port: uint16_t,
    }),
  });

  const obj = {
    a: 1,
    b: 2,
    c: {
      ip: 10,
      port: 100,
    },
  };

  const v1 = s.encode(obj, {
    littleEndian: false,
  });
  t.is(sview(v1), "00 01 00 02 00 0a 00 64");

  const v2 = s.encode(obj, {
    littleEndian: true,
  });
  t.is(sview(v2), "01 00 02 00 0a 00 64 00");
});

test("test extends", (t) => {
  class X extends StructBuffer {
    a = 10;
  }

  let s = new X({})[2][2] as any;
  t.is(s.a, 10);
});
