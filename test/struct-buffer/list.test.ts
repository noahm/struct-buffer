import test from "ava";
import {
  string_t,
  StructBuffer,
  sview,
  sbytes2 as b2,
} from "../../src/index.js";

let user: StructBuffer<any>;
let users: StructBuffer<any>;
const obj = {
  users: [
    { name: "a1", name2: "a2" },
    { name: "b1", name2: "b2" },
  ],
};
test.before(() => {
  user = new StructBuffer({
    name: string_t[2],
    name2: string_t[2],
  });
  users = new StructBuffer({
    users: user[2],
  });
});

test("test decode", (t) => {
  t.deepEqual(users.decode(b2("a1a2b1b2")), obj);
  t.is(user[2].decode(b2("a1a2b1b2")).length, 2);
});

test("test encode", (t) => {
  t.is(sview(users.encode(obj)), sview(b2("a1a2b1b2")));
});

test("test byteLength", (t) => {
  t.is(users.byteLength, 8);
});
