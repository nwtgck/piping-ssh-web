import {BigInteger} from "./BigInteger";

export const struct = {
  pack: function (e: string, a: number | BigInteger) {
    var b = "";
    switch (e) {
      case "Q":
        var d = new BigInteger("ff", 16),
            b = b + String.fromCharCode((a as BigInteger).shiftRight(56).and(d) as any as number),
            b = b + String.fromCharCode((a as BigInteger).shiftRight(48).and(d) as any as number),
            b = b + String.fromCharCode((a as BigInteger).shiftRight(40).and(d) as any as number),
            b = b + String.fromCharCode((a as BigInteger).shiftRight(32).and(d) as any as number),
            b = b + String.fromCharCode((a as BigInteger).shiftRight(24).and(d) as any as number),
            b = b + String.fromCharCode((a as BigInteger).shiftRight(16).and(d) as any as number),
            b = b + String.fromCharCode((a as BigInteger).shiftRight(8).and(d) as any as number),
            b = b + String.fromCharCode((a as BigInteger).and(d) as any as number);
        break;
      case "I":
        b += String.fromCharCode((a as number) >>>
            24 & 255), b += String.fromCharCode((a as any) >>> 16 & 255), b += String.fromCharCode((a as any) >>> 8 & 255);
      case "B":
        b += String.fromCharCode((a as number) & 255)
    }
    return b
  },
  unpack: function (e: string, a: string): any[] {
    var b = [],
        d = 0;
    let c: number | BigInteger = 0;
    switch (e) {
      case "Q":
        c = new BigInteger("0", 10);
        c = c.add((new BigInteger(a.charCodeAt(0).toString(), 10)).shiftLeft(56));
        c = c.add((new BigInteger(a.charCodeAt(1).toString(), 10)).shiftLeft(48));
        c = c.add((new BigInteger(a.charCodeAt(2).toString(), 10)).shiftLeft(40));
        c = c.add((new BigInteger(a.charCodeAt(3).toString(), 10)).shiftLeft(32));
        c = c.add((new BigInteger(a.charCodeAt(4).toString(),
            10)).shiftLeft(24));
        c = c.add((new BigInteger(a.charCodeAt(5).toString(), 10)).shiftLeft(16));
        c = c.add((new BigInteger(a.charCodeAt(6).toString(), 10)).shiftLeft(8));
        c = c.add((new BigInteger(a.charCodeAt(7).toString(), 10)).shiftLeft(0));
        b.push(c);
        break;
      case "I":
        c += a.charCodeAt(0) << 24 >>> 0, c += a.charCodeAt(1) << 16 >>> 0, c += a.charCodeAt(2) << 8 >>> 0, d += 3;
      case "B":
        c += a.charCodeAt(0 + d) << 0 >>> 0, b.push(c)
    }
    return b
  }
};
