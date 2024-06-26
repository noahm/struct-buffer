import {
  DWORD,
  string_t,
  uint32_t,
  sizeof,
  char,
  BYTE,
  WORD,
  int16_t,
  double,
  StructBuffer,
  uchar,
  typedef,
  CStruct,
  pack,
  sview,
  sbytes2 as b2,
} from "../src";

describe("test decode and encode", () => {
  it("test decode and encode", () => {
    const struct = new StructBuffer("Player", {
      hp: DWORD,
      mp: uint32_t,
      name: string_t[3],
    });
    const obj = {
      hp: 10,
      mp: 100,
      name: "abc",
    };
    const view: DataView = pack("II3s", obj.hp, obj.mp, obj.name);

    expect(struct.decode(view)).toEqual(obj);
    expect(sview(struct.encode(obj))).toBe(sview(view));
    expect(struct.byteLength).toBe(11);
  });

  it("test dword encode", () => {
    const view = DWORD[2].encode([1, 2]);
    expect(view.byteLength).toBe(8);
    expect(sview(view)).toBe(sview(pack("II", 1, 2)));
  });

  it("test dword decode", () => {
    const data = DWORD[2].decode(pack("II", 1, 2));

    expect(data.length).toBe(2);
    expect(data).toEqual([1, 2]);
  });
});

describe("test string_t", () => {
  it("test decode and encode", () => {
    let struct = new StructBuffer("Test", {
      a: string_t,
      b: string_t,
      c: string_t[2],
    });
    const obj = {
      a: "a",
      b: "b",
      c: "cd",
    };
    const view = b2("abcd");
    expect(struct.decode(view)).toEqual(obj);
    // @ts-expect-error
    expect(sview(struct.encode(obj))).toBe(sview(view));
    expect(struct.byteLength).toBe(4);
  });

  it("test names", () => {
    const obj = ["abcd", "abce", "abcf"] as any;
    const view = string_t[3][4].encode(obj);
    const names = string_t[3][4].decode(view);
    expect(names).toEqual(obj);
  });
});

describe("test char", () => {
  it("test decode and encode", () => {
    const view = b2("abcd");
    const obj = {
      a: 0x61,
      b: [0x62],
      c: [0x63, 0x64],
    };
    let struct = new StructBuffer("Test", {
      a: char,
      b: char[1],
      c: char[2],
    });
    expect(struct.decode(view)).toEqual(obj);
    expect(sview(struct.encode(obj))).toBe(sview(view));
    expect(struct.byteLength).toBe(4);
  });

  it("test char and uchar", () => {
    const s = new StructBuffer("Test", {
      a: char,
      b: uchar,
    });
    const data = s.decode(pack("bb", -1, -1));
    expect(data).toEqual({
      a: -1,
      b: 255,
    });
  });
});

describe("test pos", () => {
  let view: DataView;
  let struct: StructBuffer<any>;
  const obj = {
    pos: [
      [1.23, 22.66],
      [140.67, 742.45],
      [123.23, 1231.23],
      [534.23, 873.35],
    ],
  };
  beforeAll(() => {
    view = pack(
      "8d",
      1.23,
      22.66,
      140.67,
      742.45,
      123.23,
      1231.23,
      534.23,
      873.35,
    );

    struct = new StructBuffer("Pos", {
      pos: double[4][2],
    });
  });

  it("test decode", () => {
    expect(struct.decode(view)).toEqual(obj);
  });

  it("test decode", () => {
    expect(sview(struct.encode(obj))).toBe(sview(view));
  });

  it("test byteLength", () => {
    expect(struct.byteLength).toBe(2 * 8 * 4);
  });
});

describe("test struct nesting", () => {
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
  beforeAll(() => {
    XINPUT_GAMEPAD = new StructBuffer("XINPUT_GAMEPAD", {
      wButtons: WORD,
      bLeftTrigger: BYTE,
      bRightTrigger: BYTE,
      sThumbLX: int16_t,
      sThumbLY: int16_t,
      sThumbRX: int16_t,
      sThumbRY: int16_t,
    });
    XINPUT_STATE = new StructBuffer("XINPUT_STATE", {
      dwPacketNumber: DWORD,
      Gamepad: XINPUT_GAMEPAD,
    });
  });

  it("test decode", () => {
    const data = XINPUT_STATE.decode(pack("IH2B4h", 0, 1, 0, 0, 1, 2, 3, 4));
    expect(data).toEqual(obj);
  });

  it("test encode", () => {
    const view = XINPUT_STATE.encode(obj);
    expect(sview(view)).toBe(sview(pack("IH2B4h", 0, 1, 0, 0, 1, 2, 3, 4)));
  });

  it("test byteLength", () => {
    expect(XINPUT_STATE.byteLength).toBe(16);
  });
});

describe("test parseCStruct", () => {
  it("test parse", () => {
    const cStruct = `
//
// Structures used by XInput APIs
//
typedef struct _XINPUT_GAMEPAD
{
    WORD                                wButtons;
    BYTE                                bLeftTrigger;
    BYTE                                bRightTrigger;
    SHORT                               sThumbLX;
    SHORT                               sThumbLY;
    SHORT                               sThumbRX;
    SHORT                               sThumbRY;
} XINPUT_GAMEPAD, *PXINPUT_GAMEPAD;

typedef struct _XINPUT_STATE
{
    DWORD                               dwPacketNumber;
    XINPUT_GAMEPAD                      Gamepad;
} XINPUT_STATE, *PXINPUT_STATE;

typedef struct _XINPUT_VIBRATION
{
    WORD                                wLeftMotorSpeed;
    WORD                                wRightMotorSpeed;
} XINPUT_VIBRATION, *PXINPUT_VIBRATION;

typedef struct _XINPUT_BATTERY_INFORMATION
{
    BYTE BatteryType;
    BYTE BatteryLevel;
} XINPUT_BATTERY_INFORMATION, *PXINPUT_BATTERY_INFORMATION;

`;
    const structs = CStruct.parse(cStruct);
    expect(sizeof(structs.XINPUT_GAMEPAD)).toBe(12);
    expect(sizeof(structs.XINPUT_STATE)).toBe(16);
    expect(sizeof(structs.XINPUT_VIBRATION)).toBe(4);
    expect(sizeof(structs.XINPUT_BATTERY_INFORMATION)).toBe(2);
  });

  it("test parse 2", () => {
    const structs = CStruct.parse(`
  struct Player {
    char name[10];
    unsigned   int   health;
    DWORD coins;
    float x;
    float y;
    float z;
  };
`);

    expect(sizeof(structs.Player)).toBe(32);
    expect(structs.Player.byteLength).toBe(30);
  });
});

describe("test typedef", () => {
  it("test typedef", () => {
    const HANDLE = typedef("HANDLE", DWORD);
    expect(HANDLE.size).toBe(4);
    expect(HANDLE.unsigned).toBe(true);
  });
});

describe("test struct list", () => {
  let user: StructBuffer<any>;
  let users: StructBuffer<any>;
  const obj = {
    users: [
      { name: "a1", name2: "a2" },
      { name: "b1", name2: "b2" },
    ],
  };
  beforeAll(() => {
    user = new StructBuffer("User", {
      name: string_t[2],
      name2: string_t[2],
    });
    users = new StructBuffer("Users", {
      users: user[2],
    });
  });

  it("test decode", () => {
    expect(users.decode(b2("a1a2b1b2"))).toEqual(obj);
    expect(user[2].decode(b2("a1a2b1b2")).length).toBe(2);
  });

  it("test encode", () => {
    expect(sview(users.encode(obj))).toBe(sview(b2("a1a2b1b2")));
  });

  it("test byteLength", () => {
    expect(users.byteLength).toBe(8);
    expect(sizeof(users)).toBe(8);
  });
});

describe("test struct Multilevel array", () => {
  let player: StructBuffer<any>;
  let players: StructBuffer<any>;
  let view: DataView;
  const obj = {
    players: [
      [
        { hp: 1, mp: 1 },
        { hp: 2, mp: 2 },
      ],
      [
        { hp: 3, mp: 3 },
        { hp: 4, mp: 4 },
      ],
    ],
  };
  beforeAll(() => {
    player = new StructBuffer("Player", {
      hp: DWORD,
      mp: DWORD,
    });

    players = new StructBuffer("Players", {
      players: player[2][2],
    });

    view = pack("8I", 1, 1, 2, 2, 3, 3, 4, 4);
  });

  it("test decode", () => {
    expect(players.decode(view)).toEqual(obj);
  });

  it("test encode", () => {
    expect(sview(players.encode(obj))).toBe(sview(view));
  });

  it("test byteLength", () => {
    expect(player.byteLength).toBe(8);
    expect(players.byteLength).toBe(32);
  });

  it("test toCStruct", () => {
    // console.log(s_player.toCStruct());
    // console.log(s_players.toCStruct());
  });
});

describe("test toCStruct", () => {
  it("test toCStruct", () => {
    const XINPUT_GAMEPAD = new StructBuffer("XINPUT_GAMEPAD", {
      wButtons: WORD,
      bLeftTrigger: BYTE,
      bRightTrigger: BYTE,
      sThumbLX: int16_t,
      sThumbLY: int16_t,
      sThumbRX: int16_t,
      sThumbRY: int16_t[2],
    });
    const cStruct = CStruct.from(XINPUT_GAMEPAD);
    expect(cStruct).toEqual(
      expect.not.stringContaining(`
    typedef struct _XINPUT_GAMEPAD
    {
        WORD wButtons;
        BYTE bLeftTrigger;
        BYTE bRightTrigger;
        int16_t sThumbLX;
        int16_t sThumbLY;
        int16_t sThumbRX;
        int16_t sThumbRY[2];
    } XINPUT_GAMEPAD, *XINPUT_GAMEPAD;
    `),
    );
  });
});
