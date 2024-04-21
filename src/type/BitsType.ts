import {
  Bit_t,
  LikeBuffer_t,
  IDecodeOptions,
  IEncodeOptions,
  NumberMap_t,
} from "../interfaces";
import { createDataView } from "../utils";
import { StructType } from "./StructType";

export class BitsType<
  Template extends NumberMap_t,
  D = {
    [key in keyof Template]: boolean;
  },
  E = Partial<D>,
> extends StructType<D, E> {
  constructor(size: number, private readonly bits: Template) {
    super(size, true);
  }

  override decode(view: LikeBuffer_t, options?: IDecodeOptions): D {
    const data: number[] | number = super.decode(view, options) as any;

    return this.resultEach(data, (num: number) => {
      const itemResult: { [k: string]: boolean } = {};
      Object.entries(this.bits).forEach(([flagKey, flagIndex]) => {
        itemResult[flagKey] = !!((num & (1 << flagIndex)) >> flagIndex);
      });
      return itemResult;
    }) as any;
  }

  /**
   *
   * @param el { [flag name]: 1 or 0 }
   * @returns
   */
  private getFlags(el: any): number {
    return Object.entries<number>(el).reduce(
      (acc, [flagKey, zeroOrOneValue]) => {
        const flagIndex: number = this.bits![flagKey];
        if (flagIndex !== undefined) acc |= zeroOrOneValue << flagIndex;
        return acc;
      },
      0,
    );
  }

  override encode(obj: E, options?: IEncodeOptions): DataView {
    const v = createDataView(this.byteLength, options?.view);

    let offset = options?.offset ?? 0,
      littleEndian = options?.littleEndian;

    this.each(obj, (it) => {
      const flags = this.getFlags(it);
      v[this.set](offset, flags, littleEndian);
      offset += this.size;
    });

    return v;
  }
}

export function bits<Template extends NumberMap_t>(
  type: StructType<number, number>,
  obj: Template,
) {
  return new BitsType(type.size, obj);
}
