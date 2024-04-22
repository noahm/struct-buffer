import test from "ava";
import {
  int32_t,
  padding_t,
  string_t,
  StructBuffer,
  uint8_t,
  bits,
  BitsType,
  PaddingType,
  StringType,
  StructType,
} from "../../src/index.js";

test("type", (t) => {
  let a = int32_t;
  let b = a[2];
  let c = b[3];
  t.deepEqual((a as any).deeps, []);
  t.deepEqual((b as any).deeps, [2]);
  t.deepEqual((c as any).deeps, [2, 3]);
  t.deepEqual(a instanceof StructType, true);
  t.deepEqual(b instanceof StructType, true);
  t.deepEqual(c instanceof StructType, true);
  t.deepEqual(padding_t[2][4] instanceof PaddingType, true);
  t.deepEqual(bits(int32_t, {})[2][2] instanceof BitsType, true);
  t.deepEqual(string_t[2][2] instanceof StringType, true);
});
test("struct", (t) => {
  let a = new StructBuffer({});
  let b = a[2];
  let c = b[3];
  t.deepEqual((a as any).deeps, []);
  t.deepEqual((b as any).deeps, [2]);
  t.deepEqual((c as any).deeps, [2, 3]);
  t.deepEqual(a instanceof StructBuffer, true);
  t.deepEqual(b instanceof StructBuffer, true);
  t.deepEqual(c instanceof StructBuffer, true);
});

test("deeps length", (t) => {
  const type = uint8_t[2][3][4];
  const obj = type.decode(new Array(type.length).fill(1));
  // console.log(obj);

  t.is(obj.length, 2);
  t.is(obj[0].length, 3);
  t.is(obj[0][0].length, 4);
});
