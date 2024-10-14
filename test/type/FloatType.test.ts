import it from "ava";
import { float, sview } from "../../src/index.js";

it("encode and decode", (t) => {
  const writeFloat = 1.2345;
  const readFloat = 1.2345000505447388;

  const v1 = float.encode(0),
    v2 = float.encode(writeFloat),
    v3 = float[2].encode([writeFloat, writeFloat]),
    v4 = float[2][3].encode([
      writeFloat,
      writeFloat,
      writeFloat,
      writeFloat,
      writeFloat,
      writeFloat,
    ] as any);

  t.is(sview(v1), "00 00 00 00");
  t.is(sview(v2), "3f 9e 04 19");
  t.is(sview(v3), "3f 9e 04 19" + " 3f 9e 04 19");

  t.is(float.decode(v1), 0);
  t.deepEqual(float.decode(v2), readFloat);
  t.deepEqual(float[2].decode(v3), [readFloat, readFloat]);
  t.deepEqual(float[2][3].decode(v4), [
    [readFloat, readFloat, readFloat],
    [readFloat, readFloat, readFloat],
  ]);
});

it("byteLength", (t) => {
  t.is(float.byteLength, 4);
  t.is(float[2].byteLength, 4 * 2);
  t.is(float[2][3].byteLength, 4 * 2 * 3);
});
