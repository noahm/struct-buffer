import { sizeof } from "./struct-buffer";
import { arrayProxyNext, createDataView, makeDataView, realloc, unflattenDeep, } from "./utils";
export const FLOAT_TYPE = "float";
export const DOUBLE_TYPE = "double";
const hData = {
    1: {
        1: "getUint8",
        0: "getInt8",
    },
    2: {
        1: "getUint16",
        0: "getInt16",
    },
    4: {
        1: "getUint32",
        0: "getInt32",
    },
    8: {
        1: "getBigUint64",
        0: "getBigInt64",
    },
    f: "getFloat32",
    d: "getFloat64",
};
function typeHandle(type) {
    let h = undefined;
    const isFloat = type.isName(FLOAT_TYPE.toLowerCase()) ||
        type.isName(FLOAT_TYPE.toUpperCase());
    const isDouble = type.isName(DOUBLE_TYPE.toLowerCase()) ||
        type.isName(DOUBLE_TYPE.toUpperCase());
    if (isFloat)
        h = hData["f"];
    if (isDouble)
        h = hData["d"];
    if (type.size && !h)
        h = hData[type.size]?.[type.unsigned ? 1 : 0];
    if (!h)
        throw new Error(`StructBuffer: Unrecognized ${type} type.`);
    return [h, h.replace(/^g/, "s")];
}
class StructTypeNext {
    constructor() {
        return arrayProxyNext(this, StructTypeNext);
    }
}
export class StructType extends Array {
    get isList() {
        return !!this.deeps.length;
    }
    get count() {
        return this.deeps.reduce((acc, it) => (acc *= it), 1);
    }
    is(type) {
        return type.names.some((name) => this.names.includes(name));
    }
    isName(typeName) {
        return this.names.includes(typeName);
    }
    constructor(typeName, size, unsigned) {
        super();
        this.size = size;
        this.unsigned = unsigned;
        this.deeps = [];
        this.names = Array.isArray(typeName) ? typeName : [typeName];
        if (this.size) {
            const [get, set] = typeHandle(this);
            this.set = set;
            this.get = get;
        }
        else {
            this.set = this.get = "";
        }
        return arrayProxyNext(this, StructTypeNext);
    }
    decode(view, littleEndian = false, offset = 0) {
        view = makeDataView(view);
        const result = [];
        let i = this.count;
        while (i--) {
            result.push(view[this.get](offset, littleEndian));
            offset += this.size;
        }
        return this.isList ? unflattenDeep(result, this.deeps, false) : result[0];
    }
    encode(obj, littleEndian = false, offset = 0, view) {
        const v = createDataView(this.count * this.size, view);
        if (this.isList && Array.isArray(obj))
            obj = obj.flat();
        for (let i = 0; i < this.count; i++) {
            const it = (this.isList ? obj[i] : obj) ?? 0;
            try {
                v[this.set](offset, it, littleEndian);
            }
            catch (error) {
                v[this.set](offset, BigInt(it), littleEndian);
            }
            offset += this.size;
        }
        return v;
    }
}
export class BitsType extends StructType {
    constructor(size, bits) {
        super("<bits>", size, true);
        this.bits = bits;
    }
    decode(view, littleEndian = false, offset = 0) {
        const data = super.decode(view, littleEndian, offset);
        if (this.isList && Array.isArray(data)) {
            return data.map((it) => {
                const result = {};
                Object.entries(this.bits).forEach(([k, i]) => {
                    result[k] = !!((it & (1 << i)) >> i);
                });
                return result;
            });
        }
        else {
            const result = {};
            Object.entries(this.bits).forEach(([k, i]) => {
                result[k] = !!((data & (1 << i)) >> i);
            });
            return result;
        }
    }
    encode(obj, littleEndian = false, offset = 0, view) {
        const v = createDataView(this.count * this.size, view);
        if (this.isList && Array.isArray(obj)) {
            for (let i = 0; i < this.count; i++) {
                let flags = 0;
                Object.entries(obj[i]).forEach(([k, v]) => {
                    const i = this.bits[k];
                    if (i !== undefined)
                        flags |= v << i;
                });
                v[this.set](offset, flags, littleEndian);
                offset += this.size;
            }
            return v;
        }
        else {
            let flags = 0;
            Object.entries(obj).forEach(([k, v]) => {
                const i = this.bits[k];
                if (i !== undefined)
                    flags |= v << i;
            });
            v[this.set](offset, flags, littleEndian);
            return v;
        }
    }
}
export class BitFieldsType extends StructType {
    constructor(size, bitFields) {
        super("<bit-fields>", size, true);
        this.bitFields = bitFields;
    }
    decode(view, littleEndian = false, offset = 0) {
        const data = super.decode(view, littleEndian, offset);
        let i = 0;
        const _getValue = (data, len) => {
            let val = 0;
            let count = 0;
            while (len--) {
                const b = (data >> i) & 1;
                val |= b << count;
                i++;
                count++;
            }
            return val;
        };
        const result = {};
        if (this.isList && Array.isArray(data)) {
            return data.map((it) => {
                Object.entries(this.bitFields).forEach(([k, len]) => {
                    result[k] = _getValue(it, len);
                });
                return result;
            });
        }
        else {
            Object.entries(this.bitFields).forEach(([k, len]) => {
                result[k] = _getValue(data, len);
            });
            return result;
        }
    }
    encode(obj, littleEndian = false, offset = 0, view) {
        const v = createDataView(this.count * this.size, view);
        const _getValue = (obj) => {
            let val = 0;
            let count = 0;
            Object.entries(obj).forEach(([k, v]) => {
                const len = this.bitFields[k];
                if (len !== undefined) {
                    val |= v << count;
                    count += len;
                }
            });
            return val;
        };
        if (this.isList && Array.isArray(obj)) {
            for (let i = 0; i < this.count; i++) {
                v[this.set](offset, _getValue(obj[i]), littleEndian);
                offset += this.size;
            }
            return v;
        }
        else {
            const val = _getValue(obj);
            v[this.set](offset, val, littleEndian);
            return v;
        }
    }
}
export class BoolType extends StructType {
    constructor(typeName, type) {
        super(typeName, type.size, type.unsigned);
    }
    decode(view, littleEndian = false, offset = 0) {
        let r = super.decode(view, littleEndian, offset);
        if (Array.isArray(r)) {
            r = r.flat().map((it) => Boolean(it));
            r = unflattenDeep(r, this.deeps);
        }
        else {
            r = Boolean(r);
        }
        return r;
    }
    encode(obj, littleEndian = false, offset = 0, view) {
        if (obj && Array.isArray(obj)) {
            obj = obj.flat().map((it) => Number(Boolean(it)));
        }
        else if (obj) {
            obj = Number(Boolean(obj));
        }
        return super.encode(obj, littleEndian, offset, view);
    }
}
export class StringType extends StructType {
    constructor() {
        super("string_t", 1, true);
        this.textDecode = new TextDecoder();
        this.textEncoder = new TextEncoder();
    }
    decode(view, littleEndian = false, offset = 0, textDecode) {
        view = makeDataView(view);
        textDecode ?? (textDecode = this.textDecode);
        const result = [];
        let i = this.count;
        while (i--) {
            let data = view[this.get](offset, littleEndian);
            if (data === 0)
                break;
            data = textDecode.decode(new Uint8Array([data]));
            result.push(data);
            offset += this.size;
        }
        if (this.deeps.length < 2)
            return result.join("");
        return this.isList ? unflattenDeep(result, this.deeps, true) : result[0];
    }
    encode(obj, littleEndian = false, offset = 0, view, textEncoder) {
        const v = createDataView(this.count * this.size, view);
        if (Array.isArray(obj))
            obj = obj.flat().join("");
        textEncoder ?? (textEncoder = this.textEncoder);
        const bytes = textEncoder.encode(obj);
        for (let i = 0; i < this.count; i++) {
            const it = bytes[i] ?? 0;
            try {
                v[this.set](offset, it, littleEndian);
            }
            catch (error) {
                v[this.set](offset, BigInt(it), littleEndian);
            }
            offset += this.size;
        }
        return v;
    }
}
export class PaddingType extends StructType {
    constructor() {
        super("padding_t", 1, true);
    }
    decode(view, littleEndian = false, offset = 0) {
        view = makeDataView(view);
        let i = sizeof(this);
        const r = [];
        while (i--) {
            r.push(view[this.get](offset, littleEndian));
            offset++;
        }
        return r;
    }
    encode(zero = 0, littleEndian = false, offset = 0, view) {
        const v = createDataView(this.count * this.size, view);
        if (typeof zero !== "number")
            zero = 0;
        let length = sizeof(this);
        while (length-- > 0)
            v.setUint8(offset++, zero);
        return v;
    }
}
export class Inject extends StructType {
    constructor(hInjectDecode, hInjectEncode) {
        super("inject_t", 0, true);
        this.hInjectDecode = hInjectDecode;
        this.hInjectEncode = hInjectEncode;
    }
    decode(view, littleEndian = false, offset = 0) {
        if (!this.hInjectDecode)
            return null;
        this.size = 0;
        view = makeDataView(view);
        const result = [];
        let i = this.count;
        while (i--) {
            const res = this.hInjectDecode(view, offset);
            result.push(res.value);
            offset += res.size;
            this.size += res.size;
        }
        return this.isList ? unflattenDeep(result, this.deeps, false) : result[0];
    }
    encode(obj, littleEndian = false, offset = 0, view) {
        view = createDataView(0, view);
        if (!this.hInjectEncode)
            return view;
        this.size = 0;
        for (let i = 0; i < this.count; i++) {
            const it = this.isList ? obj[i] : obj;
            const buf = makeDataView(this.hInjectEncode(it));
            view = realloc(view, view.byteLength + buf.byteLength, buf, offset);
            offset += buf.byteLength;
            this.size += buf.byteLength;
        }
        return view;
    }
}
export function registerType(typeName, size, unsigned = true) {
    return new StructType(typeName, size, unsigned);
}
export function typedef(typeName, type) {
    const newType = registerType(typeName, type.size, type.unsigned);
    return newType;
}
export function bits(type, obj) {
    return new BitsType(type.size, obj);
}
export function bitFields(type, obj) {
    return new BitFieldsType(type.size, obj);
}
