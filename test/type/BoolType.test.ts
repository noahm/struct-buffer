import test from "ava";
import { bool, BoolType, pack, sview, uint64_t } from "../../src/index.js";

const bool64 = new BoolType(uint64_t)[3];

test("encode", (t) => {
  t.is(sview(bool.encode(2)), "01");
  t.is(sview(bool.encode(0)), "00");

  t.is(sview(bool[1].encode([2])), "01");
  t.is(sview(bool[1].encode([0])), "00");

  t.is(sview(bool[3].encode([2n, 0n, 1])), "01 00 01");

  t.is(sview(bool64.encode([true, 1n, 0n])), sview(pack("3Q", 1, 1, 0)));
});

test("decode", (t) => {
  t.is(bool.decode([2]), true);
  t.is(bool.decode([0]), false);

  t.deepEqual(bool[2].decode([2, 0]), [true, false]);
  t.deepEqual(bool[2].decode([0, 2]), [false, true]);

  t.deepEqual(bool64.decode(pack("3Q", 0n, 1n, 2n)), [false, true, true]);
});

test("byteLength", (t) => {
  t.is(bool64.byteLength, 24);
  t.is(bool.byteLength, 1);
  t.is(bool[2].byteLength, 2);
});

test("list", (t) => {
  const type = bool[2][3];

  const v = type.encode([0, 1, 1, 1, 1, 0] as any);
  const data = type.decode(v);

  t.deepEqual(data, [
    [false, true, true],
    [true, true, false],
  ]);
});
