import test from "ava";
import { string_t, sbytes2 as b2, sview } from "../src/index.js";

// https://github.com/januwA/struct-buffer/issues/1

// 这个测试比较消耗时间
// it("struct", () => {
//   const t1 = new StructBuffer("T1", {
//     name: string_t[4][2][2][16],
//     v1: ushort,
//     v2: uchar[6],
//   });

//   const t2 = new StructBuffer("T2", {
//     items: t1[4][18], // multi
//   });

//   expect(t1.byteLength).toBe(264);
//   expect(t2.byteLength).toBe(19008);
// });

test("string_t", (t) => {
  t.is(string_t[5].decode(b2("abcdefg")).length, 5); // abcde

  t.is(string_t[5].decode(b2("ab\\x00cdefg")).length, 2); // ab

  t.is(string_t[4][2].decode(b2("ab\\x00cdefg")).length, 1); // [ 'ab' ]

  // Error: overflow
  // console.log(
  //   string_t[10].decode(
  //     new Uint8Array([0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68])
  //   )
  // );

  t.is(sview(string_t[5].encode("abcdefghijk" as any)), "61 62 63 64 65");
  t.is(sview(string_t[5].encode("ab" as any)), "61 62 00 00 00");
});
