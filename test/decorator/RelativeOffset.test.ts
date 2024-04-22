import test from "ava";
import {
  StructBuffer,
  uint16_t,
  sview,
  RelativeOffset,
  uint8_t,
} from "../../src/index.js";

test("byteLength", (t) => {
  let offset: any;

  offset = new RelativeOffset(uint16_t, 2);
  t.is(offset.byteLength, uint16_t.byteLength + 2);

  offset = new RelativeOffset(uint16_t[2], 2);
  t.is(offset.byteLength, uint16_t[2].byteLength + 2);

  offset = new RelativeOffset(uint16_t, 2)[2];
  t.is(offset.byteLength, (uint16_t.byteLength + 2) * 2);

  offset = new RelativeOffset(new RelativeOffset(uint16_t, 2), 2)[3];
  t.is(offset.byteLength, (uint16_t.byteLength + 2 + 2) * 3);
});

test("struct", (t) => {
  const s = new StructBuffer({
    a: uint16_t,
    b: new RelativeOffset(
      new StructBuffer({
        c: uint16_t,
        d: uint16_t,
      }),
      2,
    ),
  });

  const view = s.encode({
    a: 1,
    b: {
      c: 2,
      d: 3,
    },
  });
  t.is(sview(view), "00 01 00 00 00 02 00 03");

  const obj = s.decode(view);
  t.deepEqual([obj.a, obj.b.c, obj.b.d], [1, 2, 3]);
});

test("type", (t) => {
  const s = new StructBuffer({
    a: uint16_t,
    b: new RelativeOffset(uint16_t[2], 2),
    c: new RelativeOffset(uint16_t, 2)[2],
  });

  t.is(
    s.byteLength,
    // a
    uint16_t.byteLength +
      // b
      2 +
      uint16_t[2].byteLength +
      //c
      (2 + uint16_t.byteLength) * 2,
  );

  const data = { a: 1, b: [2, 3], c: [4, 5] };
  const view = s.encode(data);
  t.is(
    sview(view),
    "00 01" + " 00 00 00 02 00 03" + " 00 00 00 04 00 00 00 05",
  );

  const obj = s.decode(view);
  t.deepEqual(obj, data);
});

test("array", (t) => {
  const any_t = new RelativeOffset(uint8_t, 1)[2][3];
  const data = [
    [1, 2, 3],
    [4, 5, 6],
  ];
  const view = any_t.encode(data);

  t.is(any_t.byteLength, 2 * 6);
  t.is(sview(view), "00 01 00 02 00 03 00 04 00 05 00 06");
  t.deepEqual(any_t.decode(view), data);
});
