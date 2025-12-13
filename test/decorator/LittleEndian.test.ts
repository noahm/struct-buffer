import test from "ava";
import {
  StructBuffer,
  uint16_t,
  sview,
  LittleEndian,
} from "../../src/index.js";

test("struct", (t) => {
  const s = new StructBuffer({
    a: uint16_t,
    b: new LittleEndian(
      new StructBuffer({
        c: uint16_t,
        d: uint16_t,
      }),
      true,
    ),
  });

  const view = s.encode(
    {
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
    },
    {
      littleEndian: false,
    },
  );
  t.is(sview(view), "00 01 02 00 03 00");

  const obj = s.decode(view);
  t.deepEqual([obj.a, obj.b.c, obj.b.d], [1, 2, 3]);
});

test("type", (t) => {
  const s = new StructBuffer({
    a: uint16_t,
    b: new LittleEndian(uint16_t, true)[2], // like: new LittleEndian(uint16_t[2], true)
  });

  const view = s.encode(
    { a: 1, b: [2, 3] },
    {
      littleEndian: false,
    },
  );
  t.is(sview(view), "00 01 02 00 03 00");

  const obj = s.decode(view);
  t.deepEqual([obj.a, obj.b], [1, [2, 3]]);
});

test("type 2", (t) => {
  const s = new StructBuffer({
    a: uint16_t,
    b: new LittleEndian(uint16_t, false)[2],
  });

  const opt = {
    littleEndian: true,
  };

  const view = s.encode({ a: 1, b: [2, 3] }, opt);
  t.is(sview(view), "01 00 00 02 00 03");

  const obj = s.decode(view, opt);
  t.deepEqual([obj.a, obj.b], [1, [2, 3]]);
});

test("array", (t) => {
  const any_t = new LittleEndian(uint16_t, true);
  const view = any_t[2].encode([1, 2]);
  t.is(sview(view), "01 00 02 00");
});
