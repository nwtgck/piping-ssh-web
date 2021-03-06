import {BigInteger} from "./BigInteger";

export var struct = {
  pack: function (e, a) {
    var b = "";
    switch (e) {
      case "Q":
        var d = new BigInteger("ff", 16),
            b = b + String.fromCharCode(a.shiftRight(56).and(d)),
            b = b + String.fromCharCode(a.shiftRight(48).and(d)),
            b = b + String.fromCharCode(a.shiftRight(40).and(d)),
            b = b + String.fromCharCode(a.shiftRight(32).and(d)),
            b = b + String.fromCharCode(a.shiftRight(24).and(d)),
            b = b + String.fromCharCode(a.shiftRight(16).and(d)),
            b = b + String.fromCharCode(a.shiftRight(8).and(d)),
            b = b + String.fromCharCode(a.and(d));
        break;
      case "I":
        b += String.fromCharCode(a >>>
            24 & 255), b += String.fromCharCode(a >>> 16 & 255), b += String.fromCharCode(a >>> 8 & 255);
      case "B":
        b += String.fromCharCode(a & 255)
    }
    return b
  },
  unpack: function (e, a) {
    var b = [],
        d = 0,
        c = 0;
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
