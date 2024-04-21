import { TypeDeep } from "./base/type-deep";
import {
  AnyObject,
  LikeBuffer_t,
  IDecodeOptions,
  IEncodeOptions,
  IBufferLike,
  StructBuffer_t,
} from "./interfaces";
import { createDataView, makeDataView, zeroMemory } from "./utils";

export type DecodedStructSrc<StructSrc extends StructBuffer_t> = {
  [k in keyof StructSrc]: StructSrc[k] extends StructBuffer<
    infer _Src,
    infer Decoded
  >
    ? Decoded
    : StructSrc[k] extends IBufferLike<infer Decoded, unknown>
    ? Decoded
    : never;
};

export class StructBuffer<
    StructSrc extends StructBuffer_t = StructBuffer_t,
    D = DecodedStructSrc<StructSrc>,
    E = Partial<D>,
  >
  extends TypeDeep<StructBuffer<StructSrc, D[], E[]>>
  implements IBufferLike<D, E>
{
  private readonly structKV: [string, IBufferLike<any, any>][];

  constructor(private readonly struct: StructSrc) {
    super();
    this.structKV = Object.entries(struct);
  }

  get byteLength(): number {
    const _byteLength = Object.values(this.struct).reduce(
      (acc, type) => (acc += type.byteLength),
      0,
    );
    return _byteLength * this.length;
  }

  decode(view: LikeBuffer_t, options?: IDecodeOptions): D {
    const littleEndian = options?.littleEndian,
      _view = makeDataView(view);

    let offset = options?.offset ?? 0;

    return this.resultEach([], () => {
      const res = this.structKV.reduce<AnyObject>((acc, [key, type]) => {
        acc[key] = type.decode(_view, { offset, littleEndian });
        offset += type.byteLength;
        return acc;
      }, {});

      return res;
    });
  }

  encode(obj: E, options?: IEncodeOptions): DataView {
    const byteLength = this.byteLength,
      count = this.length,
      littleEndian = options?.littleEndian;

    let view = createDataView(byteLength, options?.view),
      offset = options?.offset ?? 0;

    this.each(obj, (it: any) => {
      if (it === undefined) {
        const itemSize = byteLength / count;
        zeroMemory(view, itemSize, offset);
        offset += itemSize;
      } else {
        this.structKV.forEach(([key, type]) => {
          view = type.encode(it[key], { offset, littleEndian, view });
          offset += type.byteLength;
        });
      }
    });

    return view;
  }
}
