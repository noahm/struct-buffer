import {
  LikeBuffer_t,
  IDecodeOptions,
  IEncodeOptions,
  IBufferLike,
} from "../interfaces.js";
import { createDataView } from "../utils.js";
import BufferLikeDecorator from "./BufferLikeDecorator.js";

export interface ReshapeTransforms<SrcD, SrcE, D, E> {
  decode: (raw: SrcD) => D;
  encode: (shaped: E) => SrcE;
}

export class Reshape<SrcD, SrcE, D, E> extends BufferLikeDecorator<D, E> {
  constructor(
    src: IBufferLike<SrcD, SrcE>,
    private readonly transforms: ReshapeTransforms<SrcD, SrcE, D, E>,
  ) {
    super(src as unknown as IBufferLike<D, E>);
  }

  override decode(view: LikeBuffer_t, options?: IDecodeOptions): D {
    const newOptions = Object.assign({}, options, {
      offset: options?.offset ?? 0,
    });

    // decode one src unit per iteration, applying the transform to each,
    // then let unflattenDeep restore any array nesting around the units.
    return this.resultEach([], () => {
      const raw = this.src.decode(view, newOptions) as unknown as SrcD;
      newOptions.offset += this.src.byteLength;
      return this.transforms.decode(raw);
    });
  }

  override encode(obj: E, options?: IEncodeOptions): DataView {
    const newOptions = Object.assign({}, options, {
      offset: options?.offset ?? 0,
      view: createDataView(this.byteLength, options?.view),
    });

    for (const unit of this.units(obj)) {
      const raw = this.transforms.encode(unit);
      newOptions.view = this.src.encode(raw as unknown as E, newOptions);
      newOptions.offset += this.src.byteLength;
    }

    return newOptions.view!;
  }

  override get byteLength() {
    return super.byteLength * this.length;
  }

  /**
   * Flatten the input back into a flat list of exactly `length` reshaped
   * units. Each unit is opaque (it may itself be an array/object), so we
   * flatten only the `deeps.length - 1` levels of array nesting that this
   * decorator's own indexing added — never into a unit's own structure.
   */
  private units(obj: E): E[] {
    if (!this.isList) return [obj];
    return (obj as unknown as any[]).flat(this.deeps.length - 1);
  }
}
