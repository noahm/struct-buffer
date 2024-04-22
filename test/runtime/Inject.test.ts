import test from "ava";
import { StructBuffer, Inject, float, realloc } from "../../src/index.js";

let c_str: Inject<string, string>;

test.before(() => {
  c_str = new Inject(
    // decode
    (view: DataView, offset: number) => {
      const buf: number[] = [];
      let readOffset = offset + 0,
        data = 0;

      while (true) {
        if ((data = view.getUint8(readOffset++)) === 0) break;
        buf.push(data);
      }

      return {
        size: readOffset - offset,
        value: new TextDecoder().decode(new Uint8Array(buf)),
      };
    },

    // encode
    (value: string) => {
      const bytes: Uint8Array = new TextEncoder().encode(value);
      const res = realloc(bytes, bytes.byteLength + 1);
      return res;
    },
  );
});

test("byteLength", (t) => {
  t.is(c_str.byteLength, 0);
});

test("decode and encode", (t) => {
  const player = new StructBuffer({
    hp: float,
    name: c_str,
    mp: float,
  });

  t.is(player.byteLength, float.byteLength * 2);

  const data = {
    hp: 100.0,
    name: "Player1",
    mp: 100.0,
  };
  // <42 c8 00 00 50 6c 61 79 65 72 31 42 c8 00 00>
  const view = player.encode(data);
  const obj = player.decode(view);

  t.deepEqual(obj, data);
  t.not(player.byteLength, float.byteLength * 2);
});

test("single Inject", (t) => {
  const view = c_str.encode("hello world");
  t.is(view.getUint8(view.byteLength - 1), 0);

  const str = c_str.decode(view);
  t.is(str, "hello world");
});

test("array Inject", (t) => {
  const c_str_list = c_str[3];
  const data = ["a ", "bb", "c"];

  const view = c_str_list.encode(data);
  const obj = c_str_list.decode(view);
  t.deepEqual(obj, data);
});
