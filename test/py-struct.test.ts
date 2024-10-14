import test from "ava";
import {
  pack,
  unpack,
  sbytes as b,
  calcsize,
  sview,
  pack_into,
  createDataView,
  iter_unpack,
  Struct,
} from "../src/index.js";

test("calcsize", (t) => {
  t.is(calcsize("bb3x"), 5);
  t.is(calcsize("hhl"), 8);
  t.is(calcsize(">2i"), 8);
});

test("unpack", (t) => {
  t.deepEqual(unpack("b2xb", b("02 00 00 01")), [2, 1]);
  t.deepEqual(unpack("b3s", b("02 61 62 63")), [2, "abc"]);
  t.deepEqual(unpack("<2i", b("ff ff ff ff 02 00 00 00")), [-1, 2]);
  t.deepEqual(unpack(">2i", b("ff ff ff ff 00 00 00 02")), [-1, 2]);
  t.deepEqual(unpack("2i", b("ff ff ff ff 00 00 00 02")), [-1, 2]);
  t.deepEqual(unpack("??", b("01 00")), [true, false]);
  t.deepEqual(unpack("2?", b("01 00")), [true, false]);
});

test("pack", (t) => {
  t.is(sview(pack("b2xb", 2, 1)), "02 00 00 01");
  t.is(sview(pack("<b3s", 2, "abc")), "02 61 62 63");
  t.is(sview(pack("<2i", -1, 2)), "ff ff ff ff 02 00 00 00");
  t.is(sview(pack(">2i", -1, 2)), "ff ff ff ff 00 00 00 02");
  t.is(sview(pack("2i", -1, 2)), "ff ff ff ff 00 00 00 02");
});

test("pack_into", (t) => {
  const buf = createDataView(10);
  pack_into("b2xb", buf, 0, 2, 1);
  t.is(sview(buf).startsWith("02 00 00 01"), true);

  pack_into("<b3s", buf, 0, 2, "abc");
  t.is(sview(buf).startsWith("02 61 62 63"), true);

  pack_into("<2i", buf, 0, -1, 2);
  t.is(sview(buf).startsWith("ff ff ff ff 02 00 00 00"), true);

  pack_into(">2i", buf, 0, -1, 2);
  t.is(sview(buf).startsWith("ff ff ff ff 00 00 00 02"), true);

  pack_into("2i", buf, 0, -1, 2);
  t.is(sview(buf).startsWith("ff ff ff ff 00 00 00 02"), true);
});

test("iter_unpack", (t) => {
  const r = iter_unpack("2b", b("01 02 03 04"));
  t.deepEqual(r.next().value, [1, 2]);
  t.deepEqual(r.next().value, [3, 4]);
  t.is(r.next().done, true);
});

test("player", (t) => {
  const [hp, mp, name] = unpack(">II3s", b("00 00 00 64 00 00 00 0A 61 62 63"));
  t.is(hp, 100);
  t.is(mp, 10);
  t.is(name, "abc");
});

const strct = new Struct(">2i");

test("struct calcsize", (t) => {
  t.is(strct.size, 8);
});

test("struct unpack", (t) => {
  t.deepEqual(strct.unpack(b("ff ff ff ff 00 00 00 02")), [-1, 2]);
});

test("struct pack", (t) => {
  t.is(sview(strct.pack(-1, 2)), "ff ff ff ff 00 00 00 02");
});

test("struct pack_into", (t) => {
  const buf = createDataView(10);
  strct.pack_into(buf, 0, -1, 2);
  t.is(sview(buf).startsWith("ff ff ff ff 00 00 00 02"), true);
});

test("struct iter_unpack", (t) => {
  const r = strct.iter_unpack(pack("5i", 1, 2, 3, 4, 5));
  t.deepEqual(r.next().value, [1, 2]);
  t.deepEqual(r.next().value, [3, 4]);
  t.is(r.next().done, true);
});
