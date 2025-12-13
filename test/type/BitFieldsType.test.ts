import test from "ava";
import {
  StructBuffer,
  uint32_t,
  sview,
  uint8_t,
  sbytes as b,
  bitFields,
} from "../../src/index.js";

// https://github.com/januwA/struct-buffer/issues/3

test("test 1", (t) => {
  const s = new StructBuffer({
    a: bitFields(uint8_t, {
      alpha: 2,
      beta: 4,
      gamma: 2,
    }),
    b: uint32_t,
  });

  const v = s.encode({
    a: {
      alpha: 1,
      beta: 2,
      gamma: 3,
    },
    b: 10,
  });
  t.is(sview(v).toUpperCase(), "C9 00 00 00 0A");

  const data = s.decode(b("C9 00 00 00 0A"));
  t.is(data.a.alpha, 1);
  t.is(data.a.beta, 2);
  t.is(data.a.gamma, 3);
  t.is(data.b, 10);
});

test("test 2", (t) => {
  const bf = bitFields(uint8_t, {
    a: 1,
    b: 2,
    c: 3,
  });

  const v = bf.encode({
    a: 1,
    b: 2,
    c: 3,
  });
  t.is(sview(v), "1d");

  const data = bf.decode(v);
  t.deepEqual([data.a, data.b, data.c], [1, 2, 3]);
});

test("test list", (t) => {
  const bf = bitFields(uint8_t, {
    a: 1,
    b: 2,
    c: 3,
  })[2];

  const v = bf.encode([
    {
      a: 1,
      b: 2,
      c: 3,
    },
    {
      a: 1,
      b: 2,
      c: 3,
    },
  ]);
  t.is(sview(v), "1d 1d");

  const data = bf.decode(v);

  t.is(data.length, 2);
  t.deepEqual([data[0].a, data[0].b, data[0].c], [1, 2, 3]);
  t.deepEqual([data[1].a, data[1].b, data[1].c], [1, 2, 3]);
});
