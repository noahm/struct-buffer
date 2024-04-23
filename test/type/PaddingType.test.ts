import it from "ava";
import {
  padding_t,
  StructBuffer,
  sview,
  uint16_t,
  uint32_t,
} from "../../src/index.js";

it("encode and decode", (t) => {
  const s = new StructBuffer({
    hp: uint16_t,
    padding1: padding_t[2],
    mp: uint32_t,
  });

  const view = s.encode({
    hp: 1,
    mp: 2,
  });

  t.is(sview(view), "00 01 00 00 00 00 00 02");

  const obj = s.decode(view);
  t.deepEqual([obj.hp, obj.mp], [1, 2]);
  t.deepEqual(obj.padding1, [0, 0]);
});

it("list", (t) => {
  const type = padding_t[2][2];

  const view = type.encode(1 as any);
  t.is(sview(view), "01 01 01 01");

  const data = type.decode(view);

  t.deepEqual(data, [
    [1, 1],
    [1, 1],
  ]);

  t.deepEqual(padding_t[2].decode([1, 2, 3]), [1, 2]);
});
