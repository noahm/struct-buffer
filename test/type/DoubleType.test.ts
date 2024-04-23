import test from "ava";
import { double, sview, sbytes as b } from "../../src/index.js";

test("encode and decode", (t) => {
  const doublenum = 1.2345;

  const v1 = double.encode(0),
    v2 = double.encode(doublenum),
    v3 = double[2].encode([doublenum, doublenum]),
    v4 = double[2][3].encode([
      doublenum,
      doublenum,
      doublenum,
      doublenum,
      doublenum,
      doublenum,
    ] as any);

  t.is(sview(v1), "00 00 00 00 00 00 00 00");
  t.is(sview(v2), "3f f3 c0 83 12 6e 97 8d");
  t.is(sview(v3), "3f f3 c0 83 12 6e 97 8d" + " 3f f3 c0 83 12 6e 97 8d");

  t.is(double.decode(v1), 0);
  t.is(double.decode(v2), doublenum);
  t.deepEqual(double[2].decode(v3), [doublenum, doublenum]);
  t.deepEqual(double[2][3].decode(v4), [
    [doublenum, doublenum, doublenum],
    [doublenum, doublenum, doublenum],
  ]);
});

test("byteLength", (t) => {
  t.is(double.byteLength, 8);
  t.is(double[2].byteLength, 8 * 2);
  t.is(double[2][3].byteLength, 8 * 2 * 3);
});
