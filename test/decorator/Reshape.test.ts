import test from "ava";
import {
  StructBuffer,
  uint8_t,
  uint16_t,
  sview,
  Reshape,
} from "../../src/index.js";

test("reshape struct - combine low and high bytes", (t) => {
  const raw = new StructBuffer({
    x_lo: uint8_t,
    x_hi: uint8_t,
  });

  const reshaped = new Reshape(raw, {
    decode: (data) => ({ x: data.x_lo | (data.x_hi << 8) }),
    encode: (data: { x: number }) => ({
      x_lo: data.x & 0xff,
      x_hi: (data.x >> 8) & 0xff,
    }),
  });

  const view = reshaped.encode({ x: 0x0102 });
  t.is(sview(view), "02 01");

  const obj = reshaped.decode(view);
  t.is(obj.x, 0x0102);
});

test("reshape struct - rename fields", (t) => {
  const raw = new StructBuffer({
    a: uint16_t,
    b: uint16_t,
  });

  const reshaped = new Reshape(raw, {
    decode: (data) => ({ width: data.a, height: data.b }),
    encode: (data: { width: number; height: number }) => ({
      a: data.width,
      b: data.height,
    }),
  });

  const view = reshaped.encode({ width: 100, height: 200 });
  const obj = reshaped.decode(view);
  t.is(obj.width, 100);
  t.is(obj.height, 200);
});

test("reshape used inside another struct", (t) => {
  const inner = new StructBuffer({
    lo: uint8_t,
    hi: uint8_t,
  });

  const reshaped = new Reshape(inner, {
    decode: (data) => data.lo | (data.hi << 8),
    encode: (val: number) => ({
      lo: val & 0xff,
      hi: (val >> 8) & 0xff,
    }),
  });

  const outer = new StructBuffer({
    id: uint8_t,
    value: reshaped,
  });

  const view = outer.encode({ id: 42, value: 0x0304 });
  t.is(sview(view), "2a 04 03");

  const obj = outer.decode(view);
  t.is(obj.id, 42);
  t.is(obj.value, 0x0304);
});

test("reshape roundtrip preserves data", (t) => {
  const raw = new StructBuffer({
    r: uint8_t,
    g: uint8_t,
    b: uint8_t,
  });

  const reshaped = new Reshape(raw, {
    decode: (data) => `#${data.r.toString(16).padStart(2, "0")}${data.g.toString(16).padStart(2, "0")}${data.b.toString(16).padStart(2, "0")}`,
    encode: (hex: string) => ({
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    }),
  });

  const view = reshaped.encode("#ff8040");
  t.is(sview(view), "ff 80 40");

  const decoded = reshaped.decode(view);
  t.is(decoded, "#ff8040");
});
