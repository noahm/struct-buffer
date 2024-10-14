import test from "ava";
import { IBufferLike } from "../../src/interfaces.js";
import { Defer, int16_t, sview } from "../../src/index.js";

let t1: Defer<number, number>,
  t2: Defer<number[], number[]>,
  t3: IBufferLike<any, any>;

test.before(() => {
  t1 = new Defer(() => int16_t);
  t2 = new Defer(() => int16_t[2]);
  t3 = new Defer(() => int16_t[2])[3]; //like: new Defer(() => int16_t[2][3])
});

test("byteLength", (t) => {
  t.is(t1.byteLength, 2);
  t.is(t2.byteLength, 4);
  t.is(t3.byteLength, 4 * 3);
});

test("decode and encode", (t) => {
  const d1 = 1,
    d2 = [1, 2],
    d3 = [
      [1, 2, 3],
      [4, 5, 6],
    ];

  const v1 = t1.encode(d1),
    v2 = t2.encode(d2),
    v3 = t3.encode(d3);

  t.is(sview(v1), "00 01");
  t.is(sview(v2), "00 01 00 02");
  t.is(sview(v3), "00 01 00 02 00 03 00 04 00 05 00 06");

  t.is(t1.decode(v1), d1);
  t.deepEqual(t2.decode(v2), d2);
  t.deepEqual(t3.decode(v3), d3);
});
