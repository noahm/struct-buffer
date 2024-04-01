import { Bit_t, DecodeBuffer_t, InjectNext, TypeSize_t } from "./interfaces";
type SequenceOf<T> = T extends string ? string : Array<T>;
export declare const FLOAT_TYPE = "float";
export declare const DOUBLE_TYPE = "double";
export declare class StructType<D, E> extends Array<StructType<SequenceOf<D>, SequenceOf<E>>> {
    size: TypeSize_t;
    readonly unsigned: boolean;
    names: string[];
    deeps: number[];
    get isList(): boolean;
    get count(): number;
    is<D, E>(type: StructType<D, E>): boolean;
    isName(typeName: string): boolean;
    get: string;
    set: string;
    constructor(typeName: string | string[], size: TypeSize_t, unsigned: boolean);
    decode(view: DecodeBuffer_t, littleEndian?: boolean, offset?: number): D;
    encode(obj: E, littleEndian?: boolean, offset?: number, view?: DataView): DataView;
}
type BitsType_t = {
    [k: string]: number;
};
export declare class BitsType<Template extends BitsType_t, Decoded = {
    [key in keyof Template]: Bit_t;
}> extends StructType<Decoded, Partial<Decoded>> {
    readonly bits: Template;
    constructor(size: TypeSize_t, bits: Template);
    decode(view: DecodeBuffer_t, littleEndian?: boolean, offset?: number): Decoded;
    encode(obj: Partial<Decoded>, littleEndian?: boolean, offset?: number, view?: DataView): DataView;
}
export declare class BitFieldsType<Template extends BitsType_t, Decoded = {
    [key in keyof Template]: number;
}> extends StructType<Decoded, Partial<Decoded>> {
    readonly bitFields: Template;
    constructor(size: TypeSize_t, bitFields: Template);
    decode(view: DecodeBuffer_t, littleEndian?: boolean, offset?: number): Decoded;
    encode(obj: Partial<Decoded>, littleEndian?: boolean, offset?: number, view?: DataView): DataView;
}
export declare class BoolType<D extends boolean, E extends boolean | number> extends StructType<D, E> {
    constructor(typeName: string | string[], type: StructType<number, number>);
    decode(view: DecodeBuffer_t, littleEndian?: boolean, offset?: number): D;
    encode(obj: E, littleEndian?: boolean, offset?: number, view?: DataView): DataView;
}
export declare class StringType extends StructType<string, string> {
    constructor();
    textDecode: TextDecoder;
    textEncoder: TextEncoder;
    decode(view: DecodeBuffer_t, littleEndian?: boolean, offset?: number, textDecode?: TextDecoder): any;
    encode(obj: string, littleEndian?: boolean, offset?: number, view?: DataView, textEncoder?: TextEncoder): DataView;
}
export declare class PaddingType extends StructType<number, number> {
    constructor();
    decode(view: DecodeBuffer_t, littleEndian?: boolean, offset?: number): any;
    encode(zero?: number, littleEndian?: boolean, offset?: number, view?: DataView): DataView;
}
type HInjectDecode = (view: DataView, offset: number) => InjectNext;
type HInjectEncode = (value: any) => DecodeBuffer_t;
export declare class Inject extends StructType<any, any> {
    private hInjectDecode?;
    private hInjectEncode?;
    constructor(hInjectDecode?: HInjectDecode | undefined, hInjectEncode?: HInjectEncode | undefined);
    decode(view: DecodeBuffer_t, littleEndian?: boolean, offset?: number): any;
    encode(obj: any, littleEndian?: boolean, offset?: number, view?: DataView): DataView;
}
export declare function registerType<D extends number, E extends number>(typeName: string | string[], size: TypeSize_t, unsigned?: boolean): StructType<D, E>;
export declare function typedef<D extends number, E extends number>(typeName: string | string[], type: StructType<any, any>): StructType<D, E>;
export declare function bits<Template extends BitsType_t>(type: StructType<number, number>, obj: Template): BitsType<Template, { [key in keyof Template]: Bit_t; }>;
export declare function bitFields<Template extends BitsType_t>(type: StructType<number, number>, obj: Template): BitFieldsType<Template, { [key in keyof Template]: number; }>;
export {};
//# sourceMappingURL=class-type.d.ts.map