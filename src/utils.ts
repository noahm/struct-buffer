import {
  DataViewGet_t,
  DataViewSetExcludeBig_t,
  LikeBuffer_t,
  IType,
} from "./interfaces.js";

/**
 * 设置数组嵌套层数
 * @param array
 * @param deeps
 * @param isString
 */
export function unflattenDeep(
  array: any[] | string,
  deeps: number[],
  isString = false,
) {
  let r: any = array;

  if (isString && typeof r === "string") r = (r as any).split("");

  for (let i = deeps.length - 1; i >= 1; i--) {
    const isFirst = i === deeps.length - 1;
    const value = deeps[i];
    r = r.reduce((acc: any, it: any, index: number) => {
      if (index % value === 0) acc.push([]);
      acc[acc.length - 1].push(it);
      return acc;
    }, []);

    if (isString && isFirst) {
      r = r.map((it: any) => it.join(""));
    }
  }
  return r;
}

export function zeroMemory(view: DataView, length: number, offset: number) {
  while (length-- > 0) view.setUint8(offset++, 0);
}

/**
 * ```ts
 * createDataView(3)
 * => <00 00 00>
 * ```
 * @param byteLength
 * @param view
 */
export function createDataView(byteLength: number, view?: DataView) {
  return view ? view : new DataView(new ArrayBuffer(byteLength));
}

/**
 * ```ts
 * makeDataView([1,2,3])
 * => <01 02 03>
 * ```
 * @param view
 */
export function makeDataView(view: LikeBuffer_t): DataView {
  if (view instanceof DataView) return view;
  if (Array.isArray(view)) view = Uint8Array.from(view);
  if (!ArrayBuffer.isView(view))
    throw new Error(`Type Error: (${view}) is not an ArrayBuffer!!!`);
  return new DataView(view.buffer);
}

const HEX_PREFIX_EXP = /0x|h|\\x|\s/gi;
const HEX_BYTE_EXP = /([0-9a-f]{2})(?=[0-9a-f])/gi;

/**
 * ```
 * b('61 62 63 64 0a')
 *
 * b('616263640a')
 * b('0x610x620x630x640x0a')
 * b('0x61 0x62 0x63 0x64 0x0a')
 * b('616263 640a')
 *
 * // => <61 62 63 64 0a>
 * ```
 */
export function sbytes(str: string): DataView {
  str = str.replace(HEX_PREFIX_EXP, "");
  if (str.length % 2 !== 0) str = str.slice(0, -1);
  str = str.replace(HEX_BYTE_EXP, "$1 ");
  return makeDataView(str.split(/\s+/).map((it) => parseInt(it, 16)));
}

const HEX_EXP = /^(0x([0-9a-f]{1,2})|([0-9a-f]{1,2})h|\\x([0-9a-f]{1,2}))/i;
const HEX_SEARCH_EXP = /0x([0-9a-f]{1,2})|([0-9a-f]{1,2})h|\\x([0-9a-f]{1,2})/i;

/**
 * ```ts
 * b2('abc 0x640x0a')
 * b2('abc 0x640ah')
 * b2('abc \\x640ah')
 * // => <61 62 63 20 64 0a>
 *
 * unpack('3sxbb3s', b2('abc \\x640ahend'))
 * // => [ 'abc', 100, 10, 'end' ]
 * ```
 */
export function sbytes2(str: string, te = new TextEncoder()): DataView {
  let m;
  const bytes: number[] = [];
  while (str.length) {
    m = str.match(HEX_EXP);
    if (m && m[1]) {
      const v = m[2] ?? m[3] ?? m[4] ?? 0;
      bytes.push(parseInt(v, 16));
      str = str.substring(m[1].length);
    } else if (str.length) {
      const i = str.search(HEX_SEARCH_EXP);
      if (i < 0) {
        // all string
        bytes.push(...te.encode(str));
        str = "";
      } else {
        const s = str.substring(0, i);
        bytes.push(...te.encode(s));
        str = str.substring(i);
      }
    }
  }

  return makeDataView(bytes);
}

/**
 *
 * ArrayBufferView or number[] to string
 * ```ts
 * sview([2, 0, 0, 1])
 * // => 02 00 00 01
 *
 * sview(new Uint8Array([0, 1, 10]))
 * // => 00 01 0a
 *
 * sview(b2('abc01h2h3h'))
 * // => 61 62 63 01 02 03
 * ```
 */
export function sview(view: LikeBuffer_t): string {
  const v = makeDataView(view);
  const lst: string[] = [];
  for (let i = 0; i < v.byteLength; i++) {
    lst.push(v.getUint8(i).toString(16).padStart(2, "0"));
  }
  return lst.join(" ");
}

type Placeholder = ((byte: number) => string) | string;

/**
 * ```ts
 * const view: DataView = pack("3s2b3s2I", "abc", 1, 2, "xyz", 8, 9);
 * TEXT(view)
 * // => "abc..xyz........"
 *
 * TEXT(view, "^")
 * // => "abc^^xyz^^^^^^^^"
 * ```
 */
export function TEXT(buf: LikeBuffer_t, placeholder?: Placeholder): string;
export function TEXT(
  buf: LikeBuffer_t,
  text?: TextDecoder,
  placeholder?: Placeholder,
): string;
export function TEXT(
  buf: LikeBuffer_t,
  text?: TextDecoder | Placeholder,
  placeholder?: Placeholder,
): string {
  const view = makeDataView(buf);

  if (!text && !placeholder) {
    text = new TextDecoder();
  } else if (
    (text !== undefined && typeof text === "string") ||
    typeof text === "function"
  ) {
    placeholder = text;
    text = new TextDecoder();
  }
  let offset = 0;
  let str = "";
  let strBytes: number[] = [];
  while (true) {
    try {
      const byte = view.getUint8(offset++);
      if (byte >= 0x20) {
        strBytes.push(byte);
      } else {
        if (strBytes.length) {
          str += text!.decode(Uint8Array.from(strBytes));
          strBytes = [];
        }
        str += placeholder
          ? typeof placeholder === "string"
            ? placeholder
            : placeholder(byte)
          : ".";
      }
    } catch (error) {
      if (strBytes.length) str += text!.decode(Uint8Array.from(strBytes));
      break;
    }
  }
  return str;
}

/**
 *
 * @param mem src memory
 * @param size new memory size
 * @param pushMem this will push to new memory
 * @param pushOffset this parameter is required if pushMem is set
 * @returns new memory
 */
export function realloc(
  mem: LikeBuffer_t,
  size: number,
  pushMem?: LikeBuffer_t,
  pushOffset?: number,
) {
  const nmem = makeDataView(mem);
  const v = createDataView(size);

  // copy
  for (let i = 0; i < nmem.byteLength; i++) {
    v.setUint8(i, nmem.getUint8(i));
  }

  // push
  if (pushMem && pushOffset !== undefined) {
    const pmem = makeDataView(pushMem);
    for (let i = 0; i < pmem.byteLength; i++) {
      v.setUint8(pushOffset++, pmem.getUint8(i));
    }
  }

  return v;
}

const hData: {
  readonly [size: number | string]:
    | {
        [unsigned: number]: DataViewGet_t;
      }
    | DataViewGet_t;
} = {
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

export function typeHandle<T extends IType>(
  type: T,
): [get: DataViewGet_t, set: DataViewSetExcludeBig_t] {
  if (!type.size) return ["getUint8", "setUint8"];

  let h: DataViewGet_t | undefined = undefined;

  if (type.isFloat) h = hData["f"] as DataViewGet_t;
  if (type.isDouble) h = hData["d"] as DataViewGet_t;

  if (!h) h = hData[type.size][+type.unsigned] as DataViewGet_t;
  if (!h) throw new Error(`StructBuffer: Unrecognized ${type} type.`);

  return [h, h.replace(/^g/, "s") as DataViewSetExcludeBig_t];
}
