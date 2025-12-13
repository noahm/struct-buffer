import test from "ava";
import {
  uint32_t,
  int16_t,
  StructBuffer,
  pack,
  sview,
  uint16_t,
  uint8_t,
} from "../../src/index.js";

/*
    typedef struct _XINPUT_STATE {
      DWORD          dwPacketNumber;
      XINPUT_GAMEPAD Gamepad;
    } XINPUT_STATE, *PXINPUT_STATE;


    typedef struct _XINPUT_GAMEPAD {
      WORD  wButtons;
      BYTE  bLeftTrigger;
      BYTE  bRightTrigger;
      SHORT sThumbLX;
      SHORT sThumbLY;
      SHORT sThumbRX;
      SHORT sThumbRY;
    } XINPUT_GAMEPAD, *PXINPUT_GAMEPAD;
 */

let XINPUT_STATE: StructBuffer<any>;
let XINPUT_GAMEPAD: StructBuffer<any>;
const obj = {
  dwPacketNumber: 0,
  Gamepad: {
    wButtons: 1,
    bLeftTrigger: 0,
    bRightTrigger: 0,
    sThumbLX: 1,
    sThumbLY: 2,
    sThumbRX: 3,
    sThumbRY: 4,
  },
};
test.before(() => {
  XINPUT_GAMEPAD = new StructBuffer({
    wButtons: uint16_t,
    bLeftTrigger: uint8_t,
    bRightTrigger: uint8_t,
    sThumbLX: int16_t,
    sThumbLY: int16_t,
    sThumbRX: int16_t,
    sThumbRY: int16_t,
  });
  XINPUT_STATE = new StructBuffer({
    dwPacketNumber: uint32_t,
    Gamepad: XINPUT_GAMEPAD,
  });
});

test("test decode", (t) => {
  const data = XINPUT_STATE.decode(pack("IH2B4h", 0, 1, 0, 0, 1, 2, 3, 4));
  t.deepEqual(data, obj);
});

test("test encode", (t) => {
  const view = XINPUT_STATE.encode(obj);
  t.is(sview(view), sview(pack("IH2B4h", 0, 1, 0, 0, 1, 2, 3, 4)));
});

test("test byteLength", (t) => {
  t.is(XINPUT_STATE.byteLength, 16);
});
