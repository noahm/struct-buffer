import {
  LikeBuffer_t,
  IDecodeOptions,
  IEncodeOptions,
  IBufferLike,
} from "../interfaces.js";
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

  override intAccess(i: number) {
    const next = super.intAccess(i);
    (next as any).transforms = this.transforms;
    (next as any).src = this.src[i];
    return next;
  }

  override decode(view: LikeBuffer_t, options?: IDecodeOptions): D {
    const raw = this.src.decode(view, options) as unknown as SrcD;
    return this.transforms.decode(raw);
  }

  override encode(obj: E, options?: IEncodeOptions): DataView {
    const raw = this.transforms.encode(obj);
    return this.src.encode(raw as unknown as E, options) as DataView;
  }
}
