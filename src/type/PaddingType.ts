import { LikeBuffer_t, IDecodeOptions, IEncodeOptions } from "../interfaces.js";
import { createDataView } from "../utils.js";
import { StructType } from "./StructType.js";

export class PaddingType extends StructType<number, number> {
  constructor() {
    super(1, true);
  }

  /**
   * ```
   * padding_t[2].decode([1, 2, 3])
   * => [ 1, 2 ]
   * ```
s   */
  override decode(view: LikeBuffer_t, options?: IDecodeOptions) {
    return super.decode(view, options) as any;
  }

  /**
   *
   * ```
   * padding_t[10].encode(0 as any)
   * => <00 00 00 00 00 00 00 00 00 00>
   * ```
   */
  override encode(zero: number = 0, options?: IEncodeOptions): DataView {
    const v = createDataView(this.byteLength, options?.view);
    let offset = options?.offset ?? 0;

    if (typeof zero !== "number") zero = 0;
    let length = this.byteLength;
    while (length-- > 0) v.setUint8(offset++, zero);
    return v;
  }
}
