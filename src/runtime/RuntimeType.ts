import { TypeDeep } from "../base/type-deep.js";
import {
  LikeBuffer_t,
  IBufferLike,
  INestedBufferLike,
  IDecodeOptions,
  IEncodeOptions,
} from "../interfaces.js";

export default abstract class RuntimeType<D, E>
  extends TypeDeep<INestedBufferLike<D[], E[]>>
  implements IBufferLike<D, E>
{
  protected _byteLength: number = 0;
  get byteLength() {
    return this._byteLength;
  }

  abstract decode(view: LikeBuffer_t, options?: IDecodeOptions | undefined): D;
  abstract encode(obj: E, options?: IEncodeOptions | undefined): DataView;
}
