import test from "ava";
import {
  createDataView,
  makeDataView,
  pack,
  sbytes as b,
  sbytes2 as b2,
  sview,
  TEXT,
  realloc,
  uint8_t,
  uint64_t,
  float,
  double,
} from "../src/index.js";

import { zeroMemory, typeHandle } from "../src/utils.js";

test("createDataView", (t) => {
  t.is(sview(createDataView(3)), "00 00 00");
});

test("makeDataView", (t) => {
  t.is(sview(makeDataView(pack("3B", 1, 2, 3))), "01 02 03");
  t.is(sview(makeDataView([1, 2, 3])), "01 02 03");
  t.is(sview(makeDataView(Uint8Array.from([1, 2, 3]))), "01 02 03");
});

test("sbytes", (t) => {
  t.is(sview(b("01 02 03")), "01 02 03");
  t.is(sview(b("010203")), "01 02 03");
  t.is(sview(b("010  20   34")), "01 02 03");
  t.is(sview(b("0x01\\x02 03h")), "01 02 03");
});

test("sbytes2 parse string", (t) => {
  t.is(sview(b2("abc\\x1\\x2\\x3")), "61 62 63 01 02 03");
});

test("TEXT", (t) => {
  const view: DataView = pack("3s2b3s2I", "abc", 1, 2, "xyz", 8, 9);
  t.is(TEXT(view), "abc..xyz........");
  t.is(
    TEXT(view, (byte: number) => {
      return " " + byte.toString(16).padStart(2, "0");
    }),
    "abc 01 02xyz 00 00 00 08 00 00 00 09",
  );
  t.is(TEXT(view, "^"), "abc^^xyz^^^^^^^^");
});

test("zeroMemory", (t) => {
  const v: DataView = pack("4B", 1, 2, 3, 4);
  zeroMemory(v, 4, 0);

  t.is(sview(v), "00 00 00 00");
});

test("realloc", (t) => {
  // copy
  let mem = pack("3B", 1, 2, 3);
  const newMemSize = 6;
  let newMem = realloc(mem, newMemSize);
  t.is(sview(newMem), "01 02 03 00 00 00");
  t.is(mem !== newMem, true);

  // copy and push
  const pushMem = pack("3B", 3, 2, 1);
  const pushOffset = 3;
  newMem = realloc(mem, newMemSize, pushMem, pushOffset);
  t.is(sview(newMem), "01 02 03 03 02 01");
  t.is(mem !== newMem, true);
});

test("typeHandle", (t) => {
  t.deepEqual(typeHandle(uint8_t), ["getUint8", "setUint8"]);
  t.deepEqual(typeHandle(uint64_t), ["getBigUint64", "setBigUint64"]);
  t.deepEqual(typeHandle(float), ["getFloat32", "setFloat32"]);
  t.deepEqual(typeHandle(double), ["getFloat64", "setFloat64"]);
});
