import {toByteArray} from "./utilities";

export const sjcl = {
  cipher: {}
};
sjcl.cipher.aes = function (e, d) {
  this._tables[0][0][0] || this._precompute();
  this.mode = d;
  var c, b, a, f, g, h = this._tables[0][4],
      n = this._tables[1];
  b = e.length;
  var l = 1;
  if (4 !== b && 6 !== b && 8 !== b) throw "invalid aes key size";
  this._key = [f = e.slice(0), g = []];
  for (c = b; c < 4 * b + 28; c++) {
    a = f[c - 1];
    if (0 === c % b || 8 === b && 4 === c % b) a = h[a >>> 24] << 24 ^ h[a >> 16 & 255] << 16 ^ h[a >> 8 & 255] << 8 ^ h[a & 255], 0 === c % b && (a = a << 8 ^ a >>> 24 ^ l << 24, l = l << 1 ^ 283 * (l >> 7));
    f[c] = f[c - b] ^ a
  }
  for (b = 0; c; b++, c--) a = f[b & 3 ? c : c - 4], g[b] = 4 >= c || 4 > b ? a : n[0][h[a >>> 24]] ^ n[1][h[a >> 16 & 255]] ^ n[2][h[a >>
  8 & 255]] ^ n[3][h[a & 255]]
};
sjcl.cipher.aes.MODE_CBC = 2;
sjcl.cipher.aes.MODE_CTR = 6;
sjcl.cipher.aes.prototype = {
  encrypt: function (e, d, c) {
    d = this.mode == sjcl.cipher.aes.MODE_CBC ? d : [];
    for (var b = [], a = 0; a < e.length / 16; a++) {
      var f = e.slice(16 * a, 16 * (a + 1));
      if (this.mode == sjcl.cipher.aes.MODE_CBC) {
        for (var g = 0; 16 > g; g++) f[g] ^= d[g];
        d = sjcl.codec.bytes.fromBits(this._crypt(sjcl.codec.bytes.toBits(f), 0))
      } else
        for (d = sjcl.codec.bytes.fromBits(this._crypt(sjcl.codec.bytes.toBits(toByteArray(c.increment())), 0)), g = 0; 16 > g; g++) d[g] ^= f[g];
      b = b.concat(d)
    }
    return b
  },
  decrypt: function (e, d) {
    for (var c = [], b = 0; b < e.length /
    16; b++) {
      var a = e.slice(16 * b, 16 * (b + 1));
      var ct = sjcl.codec.bytes.fromBits(this._crypt(sjcl.codec.bytes.toBits(a), 1));
      if (this.mode == sjcl.cipher.aes.MODE_CBC) {
        for (var f = 0; 16 > f; f++) ct[f] ^= d[f];
        d = a
      }
      c = c.concat(ct)
    }
    return c
  },
  _tables: [
    [
      [],
      [],
      [],
      [],
      []
    ],
    [
      [],
      [],
      [],
      [],
      []
    ]
  ],
  _precompute: function () {
    var e = this._tables[0],
        d = this._tables[1],
        c = e[4],
        b = d[4],
        a, f, g, h = [],
        n = [],
        l, p, k, m;
    for (a = 0; 256 > a; a++) n[(h[a] = a << 1 ^ 283 * (a >> 7)) ^ a] = a;
    for (f = g = 0; !c[f]; f ^= l || 1, g = n[g] || 1)
      for (k = g ^ g << 1 ^ g << 2 ^ g << 3 ^ g << 4, k = k >> 8 ^ k & 255 ^ 99, c[f] = k, b[k] = f, p = h[a =
          h[l = h[f]]], m = 16843009 * p ^ 65537 * a ^ 257 * l ^ 16843008 * f, p = 257 * h[k] ^ 16843008 * k, a = 0; 4 > a; a++) e[a][f] = p = p << 24 ^ p >>> 8, d[a][k] = m = m << 24 ^ m >>> 8;
    for (a = 0; 5 > a; a++) e[a] = e[a].slice(0), d[a] = d[a].slice(0)
  },
  _crypt: function (e, d) {
    if (4 !== e.length) throw "invalid aes block size";
    var c = this._key[d],
        b = e[0] ^ c[0],
        a = e[d ? 3 : 1] ^ c[1],
        f = e[2] ^ c[2],
        g = e[d ? 1 : 3] ^ c[3],
        h, n, l, p = c.length / 4 - 2,
        k, m = 4,
        w = [0, 0, 0, 0];
    h = this._tables[d];
    var q = h[0],
        r = h[1],
        t = h[2],
        u = h[3],
        v = h[4];
    for (k = 0; k < p; k++) h = q[b >>> 24] ^ r[a >> 16 & 255] ^ t[f >> 8 & 255] ^ u[g & 255] ^ c[m], n = q[a >>> 24] ^ r[f >>
    16 & 255] ^ t[g >> 8 & 255] ^ u[b & 255] ^ c[m + 1], l = q[f >>> 24] ^ r[g >> 16 & 255] ^ t[b >> 8 & 255] ^ u[a & 255] ^ c[m + 2], g = q[g >>> 24] ^ r[b >> 16 & 255] ^ t[a >> 8 & 255] ^ u[f & 255] ^ c[m + 3], m += 4, b = h, a = n, f = l;
    for (k = 0; 4 > k; k++) w[d ? 3 & -k : k] = v[b >>> 24] << 24 ^ v[a >> 16 & 255] << 16 ^ v[f >> 8 & 255] << 8 ^ v[g & 255] ^ c[m++], h = b, b = a, a = f, f = g, g = h;
    return w
  }
};
sjcl.codec = {};
sjcl.codec.bytes = {
  fromBits: function (e) {
    var d = [],
        c = sjcl.bitArray.bitLength(e),
        b, a;
    for (b = 0; b < c / 8; b++) 0 === (b & 3) && (a = e[b / 4]), d.push(a >>> 24), a <<= 8;
    return d
  },
  toBits: function (e) {
    var d = [],
        c, b = 0;
    for (c = 0; c < e.length; c++) b = b << 8 | e[c], 3 === (c & 3) && (d.push(b), b = 0);
    c & 3 && d.push(sjcl.bitArray.partial(8 * (c & 3), b));
    return d
  }
};
sjcl.bitArray = {
  bitLength: function (e) {
    var d = e.length;
    return 0 === d ? 0 : 32 * (d - 1) + sjcl.bitArray.getPartial(e[d - 1])
  },
  partial: function (e, d, c) {
    return 32 === e ? d : (c ? d | 0 : d << 32 - e) + 1099511627776 * e
  },
  getPartial: function (e) {
    return Math.round(e / 1099511627776) || 32
  }
};
