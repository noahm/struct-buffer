import { uint32_t, bits, StructBuffer, uint16_t } from "../../src";

describe("bits test", () => {
  it("decode and encode", () => {
    // zf,pf,if
    const eflag_data = 0x00000246;
    const opt = { littleEndian: true };

    const EFLAG = bits(uint32_t, {
      CF: 0,
      PF: 2,
      AF: 4,
      ZF: 6,
      SF: 7,
      TF: 8,
      IF: 9,
      DF: 10,
      OF: 11,
    });
    const data = EFLAG.decode(new Uint32Array([eflag_data]), opt);
    expect([data.ZF, data.PF, data.IF]).toEqual([1, 1, 1]);

    const view = EFLAG.encode(
      {
        PF: true,
        ZF: true,
        IF: true,
      },
      opt,
    );
    expect(view.getUint8(0)).toBe(0x44);
  });

  it("test struct", () => {
    const struct = new StructBuffer({
      id: uint16_t,
      eflag: bits(uint32_t, {
        PF: 2,
        ZF: 6,
        TF: 8,
        IF: 9,
      })[2],
    });

    const data = struct.decode([
      0, 1, 0x00, 0x00, 0x02, 0x46, 0x00, 0x00, 0x02, 0x46,
    ]);
    expect(data.eflag.length).toBe(2);
  });
});