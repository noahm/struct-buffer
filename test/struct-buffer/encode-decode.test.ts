import test from "ava";
import {
  string_t,
  uint32_t,
  uint64_t,
  StructBuffer,
  pack,
  sview,
} from "../../src/index.js";

test("test decode and encode", (t) => {
  const struct = new StructBuffer({
    hp: uint32_t,
    mp: uint32_t,
    name: string_t[3],
  });
  const obj = {
    hp: 10,
    mp: 100,
    name: "abc",
  };
  const view: DataView = pack("II3s", obj.hp, obj.mp, obj.name);

  t.deepEqual(struct.decode(view), obj);
  t.is(sview(struct.encode(obj)), sview(view));
  t.is(struct.byteLength, 11);
});

test("test uint32_t encode", (t) => {
  const view = uint32_t[2].encode([1, 2]);
  t.is(view.byteLength, 8);
  t.is(sview(view), sview(pack("II", 1, 2)));

  const data = uint32_t[2].decode(view);

  t.is(data.length, 2);
  t.deepEqual(data, [1, 2]);
});

test("test uint64_t encode", (t) => {
  const view = uint64_t[2].encode([1n, 2n]);
  t.is(view.byteLength, 16);
  t.is(sview(view), sview(pack("QQ", 1, 2)));

  const data = uint64_t[2].decode(view);

  t.is(data.length, 2);
  t.deepEqual(data, [1n, 2n]);
});
