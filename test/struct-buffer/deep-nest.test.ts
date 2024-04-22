import test from "ava";
import { uint32_t, StructBuffer, pack, sview } from "../../src/index.js";

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
