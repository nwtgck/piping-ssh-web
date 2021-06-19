import {BigInteger} from "./BigInteger";
import {struct} from "./struct";

export function inflate_long(a: string) {
  var c = new BigInteger("0", 10);
  a.length % 4 && (a = Array(4 - a.length % 4 + 1).join("\x00") + a);
  for (var b = 0; b < a.length; b += 4)
    // @ts-ignore
    c = c.shiftLeft(32), c = c.add(new BigInteger(struct.unpack("I", a.substring(b, b + 4))[0].toString(), 10));
  return c
}

export function deflate_long(a: number | any, c: boolean | undefined) {
  a = "number" == typeof a ? new BigInteger(a.toString(), 10) : a.clone();
  c = void 0 == c ? !0 : c;
  for (var b = "", d = new BigInteger("-1", 10), f = new BigInteger("ffffffff", 16); !a.equals(BigInteger.ZERO) && !a.equals(d);) b = struct.pack("I", a.and(f)) + b, a = a.shiftRight(32);
  f = !1 as any;
  let e = 0
  for (; e < b.length; ++e) {
    if (a.equals(BigInteger.ZERO) && "\x00" != b.charAt(e)) {
      f = !0 as any;
      break
    }
    if (a.equals(d) && "\u00ff" != b.charAt(e)) {
      f = !0 as any;
      break
    }
  }
  f || (e = 0, b = a.equals(BigInteger.ZERO) ? "\x00" : "\u00ff");
  b = b.substring(e);
  c && (a.equals(BigInteger.ZERO) &&
  128 <= b.charCodeAt(0) && (b = "\x00" + b), a.equals(d) && 128 > b.charCodeAt(0) && (b = "\u00ff" + b));
  return b
}

// Converts strings to byte arrays
export function toByteArray(a: string): Uint8Array {
  const bufView = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    bufView[i] = a.charCodeAt(i);
  }
  return bufView;
}

// Converts byte arrays to strings
export function fromByteArray(a: Iterable<number>) {
  return String.fromCharCode.apply(null, new Uint8Array(a) as any as number[]);
}

// Converts bytes to words
export function bytesToWords(a: number[]) {
  for (var c: number[] = [], b = 0, d = 0; b < a.length; b++, d += 8) c[d >>> 5] |= (a[b] & 255) << 24 - d % 32;
  return c
}

// Converts words to bytes
export function wordsToBytes(a: number[]) {
  for (var c = [], b = 0; b < 32 * a.length; b += 8) c.push(a[b >>> 5] >>> 24 - b % 32 & 255);
  return c
}

// Used to set specific values for the AES counter
export function setCharAt(a: string, c: number, b: number) {
  return a.substring(0, c) + b + a.substring(c + 1)
}

// Converts UTF-8 strings to raw encoding that xtemrm.js can handle
export function fromUtf8(str: string) {
  let c2;
  let res = '';
  const bytes = toByteArray(str);
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (c >= 0x00C0 && c <= 0x00DF) {
      c2 = bytes[++i];
      c = ((c & 0x1F) << 6) | (c2 & 0x3F);
    } else if (c >= 0x00E0 && c <= 0x00EF) {
      c2 = bytes[++i];
      const c3 = bytes[++i];
      c = ((c & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
    } else if (c >= 0x0080) {
      c = '.' as any; // Invalid encoding, unprintable character
    }
    res += String.fromCharCode(c);
  }
  return res;
}

// returns a b byte random number
export function read_rng(b: Iterable<number>) {
  return String.fromCharCode.apply(null, window.crypto.getRandomValues(new Uint8Array(b)) as any as number[]);
}

// Used for filtering algorithms and selecting the algorithms to be used during kex_init
export function filter(client: string, server: number[]) {
  client = client.split(',') as any
  for (let x = 0; x < client.length; ++x) {
    if (server.indexOf(client[x] as any) != -1) {
      return client[x];
    }
  }
  return
}

// Used to split large chunks of text pasted into the client into managable portions
export function splitSlice(str: string, len = 5000) {
  const ret = [];
  for (let offset = 0, strLen = str.length; offset < strLen; offset += len) {
    ret.push(str.slice(offset, len + offset));
  }
  return ret;
}

// Modifies a hex color by percent (+/-) light/darkness
export function modColorPercent(color: string, percent: number) {
  var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent,
      R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
  return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

// 	Converts an ascii string to hex encoded string
export function ascii2hex(a: string) {
  for (var c = "", b = 0; b < a.length; b++) c = 1 == a.charCodeAt(b).toString(16).length ? c + ("0" + a.charCodeAt(b).toString(16)) : c + ("" + a.charCodeAt(b).toString(16));
  return c;
}

// Moves the cursor back one and deletes a character from xtermjs term
export function termBackspace(term: any) {
  term.write('\b');
  term.eraseRight(term.buffers._terminal.buffer.x - 1, term.buffers._terminal.buffer.y);
}
