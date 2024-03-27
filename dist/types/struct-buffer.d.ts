import { StructType } from "./class-type";
import { DecodeBuffer_t } from "./interfaces";
export type Type_t = StructType<any, any> | StructBuffer;
export type StructBuffer_t = {
    [k: string]: Type_t;
};
export declare function sizeof(type: Type_t): number;
type StructBufferConfig = {
    textDecode?: TextDecoder;
    textEncoder?: TextEncoder;
    littleEndian?: boolean;
};
export declare class StructBuffer<StructSrc extends StructBuffer_t = StructBuffer_t, D = {
    [k in keyof StructSrc]: any;
}, E = Partial<D>> extends Array<StructBuffer<StructSrc, D[], E[]>> {
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