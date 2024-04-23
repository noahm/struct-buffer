import test from "ava";
import { double, StructBuffer, pack, sview } from "../../src/index.js";

let view: DataView;
let struct: StructBuffer<any>;
const obj = {
  pos: [
    [1.23, 22.66],
    [140.67, 742.45],
    [123.23, 1231.23],
    [534.23, 873.35],
  ],
};
test.before(() => {
  view = pack(
    "8d",
    1.23,
    22.66,
    140.67,
    742.45,
    123.23,
    1231.23,
    534.23,
    873.35,
  );

  struct = new StructBuffer({
    pos: double[4][2],
  });
});

test("test decode", (t) => {
  t.deepEqual(struct.decode(view), obj);
});

test("test encode", (t) => {
  t.is(sview(struct.encode(obj)), sview(view));
});

test("test byteLength", (t) => {
  t.is(struct.byteLength, 8 * 4 * 2);
});
