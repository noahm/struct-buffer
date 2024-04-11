import { StructType } from "./class-type";
import { DecodeBuffer_t } from "./interfaces";
export type Type_t = StructType<any, any> | StructBuffer<any, any, any>;
export type StructBuffer_t = {
    [k: string]: Type_t;
};
export type DecodedStructSrc<StructSrc extends StructBuffer_t> = {
    [k in keyof StructSrc]: StructSrc[k] extends StructBuffer<infer Whatever, infer Decoded> ? Decoded : StructSrc[k] extends StructType<infer D, unknown> ? D : never;
};
export declare function sizeof(type: Type_t): number;
type StructBufferConfig = {
    textDecode?: TextDecoder;
    textEncoder?: TextEncoder;
    littleEndian?: boolean;
};
export declare class StructBuffer<StructSrc extends StructBuffer_t = StructBuffer_t, D = DecodedStructSrc<StructSrc>, E = D> extends Array<StructBuffer<StructSrc, D[], E[]>> {
    structName: string;
    struct: StructSrc;
    deeps: number[];
    config: StructBufferConfig;
    structKV: [string, Type_t][];
    constructor(structName: string, struct: StructSrc, config?: StructBufferConfig);
    get isList(): boolean;
    get count(): number;
    get byteLength(): number;
    get maxSize(): number;
    decode(view: DecodeBuffer_t, littleEndian?: boolean, offset?: number): D;
    encode(obj: E, littleEndian?: boolean, offset?: number, view?: DataView): DataView;
}
export {};
//# sourceMappingURL=struct-buffer.d.ts.map