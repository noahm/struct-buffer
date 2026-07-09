import test from "ava";
import { uint32_t, StructBuffer, pack, sview } from "../../src/index.js";
import type { Equal, Expect, NotAny } from "../_type-utils.js";

let player: StructBuffer<any>;
let players: StructBuffer<any>;
let view: DataView;
const obj = {
  players: [
    [
      { hp: 1, mp: 1 },
      { hp: 2, mp: 2 },
    ],
    [
      { hp: 3, mp: 3 },
      { hp: 4, mp: 4 },
    ],
  ],
};
test.before(() => {
  player = new StructBuffer({
    hp: uint32_t,
    mp: uint32_t,
  });

  players = new StructBuffer({
    players: player[2][2],
  });

  view = pack("8I", 1, 1, 2, 2, 3, 3, 4, 4);
});

test("test decode", (t) => {
  t.deepEqual(players.decode(view), obj);
});

test("test encode", (t) => {
  t.is(sview(players.encode(obj)), sview(view));
});

test("test byteLength", (t) => {
  t.is(player.byteLength, 8);
  t.is(players.byteLength, 32);
});

test("indexing keeps types through two levels of nesting", (t) => {
  // a StructBuffer recurses through its own class type, so indexing must keep
  // the decoded/encoded shape typed (never falling back to any) at any depth
  const unit = new StructBuffer({ hp: uint32_t, mp: uint32_t });
  type Unit = { hp: number; mp: number };

  type _sbDecode0 = Expect<Equal<ReturnType<typeof unit.decode>, Unit>>;
  type _sbDecode1 = Expect<
    Equal<ReturnType<(typeof unit)[2]["decode"]>, Unit[]>
  >;
  type _sbNotAny = Expect<NotAny<(typeof unit)[2][2]>>;
  type _sbDecode2 = Expect<
    Equal<ReturnType<(typeof unit)[2][2]["decode"]>, Unit[][]>
  >;
  type _sbEncode2 = Expect<
    Equal<Parameters<(typeof unit)[2][2]["encode"]>[0], Partial<Unit>[][]>
  >;

  // the same must hold for a primitive StructType like uint32_t
  type _ptDecode1 = Expect<
    Equal<ReturnType<(typeof uint32_t)[2]["decode"]>, number[]>
  >;
  type _ptNotAny = Expect<NotAny<(typeof uint32_t)[2][2]>>;
  type _ptDecode2 = Expect<
    Equal<ReturnType<(typeof uint32_t)[2][2]["decode"]>, number[][]>
  >;
  type _ptEncode2 = Expect<
    Equal<Parameters<(typeof uint32_t)[2][2]["encode"]>[0], number[][]>
  >;

  // runtime sanity so ava counts this as a real test
  t.is(unit[2][2].byteLength, 32);
});
