var BigInteger = function () {
      function e(a, b, c) {
        null != a && ("number" == typeof a ? this.fromNumber(a, b, c) : null == b && "string" != typeof a ? this.fromString(a, 256) : this.fromString(a, b))
      }

      function l() {
        return new e(null)
      }

      function F(a, b, c, d, k, e) {
        for (; 0 <= --e;) {
          var f = b * this[a++] + c[d] + k;
          k = Math.floor(f / 67108864);
          c[d++] = f & 67108863
        }
        return k
      }

      function G(a, b, c, d, k, e) {
        var f = b & 32767;
        for (b >>= 15; 0 <= --e;) {
          var g = this[a] & 32767,
              l = this[a++] >> 15,
              m = b * g + l * f,
              g = f * g + ((m & 32767) << 15) + c[d] + (k & 1073741823);
          k = (g >>> 30) + (m >>> 15) + b * l + (k >>> 30);
          c[d++] =
              g & 1073741823
        }
        return k
      }

      function H(a, b, c, d, k, e) {
        var f = b & 16383;
        for (b >>= 14; 0 <= --e;) {
          var g = this[a] & 16383,
              l = this[a++] >> 14,
              m = b * g + l * f,
              g = f * g + ((m & 16383) << 14) + c[d] + k;
          k = (g >> 28) + (m >> 14) + b * l;
          c[d++] = g & 268435455
        }
        return k
      }

      function B(a, b) {
        var c = y[a.charCodeAt(b)];
        return null == c ? -1 : c
      }

      function t(a) {
        var b = l();
        b.fromInt(a);
        return b
      }

      function z(a) {
        var b = 1,
            c;
        0 != (c = a >>> 16) && (a = c, b += 16);
        0 != (c = a >> 8) && (a = c, b += 8);
        0 != (c = a >> 4) && (a = c, b += 4);
        0 != (c = a >> 2) && (a = c, b += 2);
        0 != a >> 1 && (b += 1);
        return b
      }

      function u(a) {
        this.m = a
      }

      function w(a) {
        this.m =
            a;
        this.mp = a.invDigit();
        this.mpl = this.mp & 32767;
        this.mph = this.mp >> 15;
        this.um = (1 << a.DB - 15) - 1;
        this.mt2 = 2 * a.t
      }

      function I(a, b) {
        return a & b
      }

      function A(a, b) {
        return a | b
      }

      function C(a, b) {
        return a ^ b
      }

      function D(a, b) {
        return a & ~b
      }

      function v() {
      }

      function E(a) {
        return a
      }

      function x(a) {
        this.r2 = l();
        this.q3 = l();
        e.ONE.dlShiftTo(2 * a.t, this.r2);
        this.mu = this.r2.divide(a);
        this.m = a
      }

      var m;
      "Microsoft Internet Explorer" == navigator.appName ? (e.prototype.am = G, m = 30) : "Netscape" != navigator.appName ? (e.prototype.am = F, m = 26) : (e.prototype.am =
          H, m = 28);
      e.prototype.DB = m;
      e.prototype.DM = (1 << m) - 1;
      e.prototype.DV = 1 << m;
      e.prototype.FV = Math.pow(2, 52);
      e.prototype.F1 = 52 - m;
      e.prototype.F2 = 2 * m - 52;
      var y = [],
          n;
      m = 48;
      for (n = 0; 9 >= n; ++n) y[m++] = n;
      m = 97;
      for (n = 10; 36 > n; ++n) y[m++] = n;
      m = 65;
      for (n = 10; 36 > n; ++n) y[m++] = n;
      u.prototype.convert = function (a) {
        return 0 > a.s || 0 <= a.compareTo(this.m) ? a.mod(this.m) : a
      };
      u.prototype.revert = function (a) {
        return a
      };
      u.prototype.reduce = function (a) {
        a.divRemTo(this.m, null, a)
      };
      u.prototype.mulTo = function (a, b, c) {
        a.multiplyTo(b, c);
        this.reduce(c)
      };
      u.prototype.sqrTo =
          function (a, b) {
            a.squareTo(b);
            this.reduce(b)
          };
      w.prototype.convert = function (a) {
        var b = l();
        a.abs().dlShiftTo(this.m.t, b);
        b.divRemTo(this.m, null, b);
        0 > a.s && 0 < b.compareTo(e.ZERO) && this.m.subTo(b, b);
        return b
      };
      w.prototype.revert = function (a) {
        var b = l();
        a.copyTo(b);
        this.reduce(b);
        return b
      };
      w.prototype.reduce = function (a) {
        for (; a.t <= this.mt2;) a[a.t++] = 0;
        for (var b = 0; b < this.m.t; ++b) {
          var c = a[b] & 32767,
              d = c * this.mpl + ((c * this.mph + (a[b] >> 15) * this.mpl & this.um) << 15) & a.DM,
              c = b + this.m.t;
          for (a[c] += this.m.am(0, d, a, b, 0, this.m.t); a[c] >=
          a.DV;) a[c] -= a.DV, a[++c]++
        }
        a.clamp();
        a.drShiftTo(this.m.t, a);
        0 <= a.compareTo(this.m) && a.subTo(this.m, a)
      };
      w.prototype.mulTo = function (a, b, c) {
        a.multiplyTo(b, c);
        this.reduce(c)
      };
      w.prototype.sqrTo = function (a, b) {
        a.squareTo(b);
        this.reduce(b)
      };
      e.prototype.copyTo = function (a) {
        for (var b = this.t - 1; 0 <= b; --b) a[b] = this[b];
        a.t = this.t;
        a.s = this.s
      };
      e.prototype.fromInt = function (a) {
        this.t = 1;
        this.s = 0 > a ? -1 : 0;
        0 < a ? this[0] = a : -1 > a ? this[0] = a + DV : this.t = 0
      };
      e.prototype.fromString = function (a, b) {
        var c;
        if (16 == b) c = 4;
        else if (8 == b) c = 3;
        else if (256 ==
            b) c = 8;
        else if (2 == b) c = 1;
        else if (32 == b) c = 5;
        else if (4 == b) c = 2;
        else {
          this.fromRadix(a, b);
          return
        }
        this.s = this.t = 0;
        for (var d = a.length, k = !1, f = 0; 0 <= --d;) {
          var h = 8 == c ? a[d] & 255 : B(a, d);
          0 > h ? "-" == a.charAt(d) && (k = !0) : (k = !1, 0 == f ? this[this.t++] = h : f + c > this.DB ? (this[this.t - 1] |= (h & (1 << this.DB - f) - 1) << f, this[this.t++] = h >> this.DB - f) : this[this.t - 1] |= h << f, f += c, f >= this.DB && (f -= this.DB))
        }
        8 == c && 0 != (a[0] & 128) && (this.s = -1, 0 < f && (this[this.t - 1] |= (1 << this.DB - f) - 1 << f));
        this.clamp();
        k && e.ZERO.subTo(this, this)
      };
      e.prototype.clamp = function () {
        for (var a =
            this.s & this.DM; 0 < this.t && this[this.t - 1] == a;) --this.t
      };
      e.prototype.dlShiftTo = function (a, b) {
        var c;
        for (c = this.t - 1; 0 <= c; --c) b[c + a] = this[c];
        for (c = a - 1; 0 <= c; --c) b[c] = 0;
        b.t = this.t + a;
        b.s = this.s
      };
      e.prototype.drShiftTo = function (a, b) {
        for (var c = a; c < this.t; ++c) b[c - a] = this[c];
        b.t = Math.max(this.t - a, 0);
        b.s = this.s
      };
      e.prototype.lShiftTo = function (a, b) {
        var c = a % this.DB,
            d = this.DB - c,
            e = (1 << d) - 1,
            f = Math.floor(a / this.DB),
            h = this.s << c & this.DM,
            g;
        for (g = this.t - 1; 0 <= g; --g) b[g + f + 1] = this[g] >> d | h, h = (this[g] & e) << c;
        for (g = f - 1; 0 <= g; --g) b[g] =
            0;
        b[f] = h;
        b.t = this.t + f + 1;
        b.s = this.s;
        b.clamp()
      };
      e.prototype.rShiftTo = function (a, b) {
        b.s = this.s;
        var c = Math.floor(a / this.DB);
        if (c >= this.t) b.t = 0;
        else {
          var d = a % this.DB,
              e = this.DB - d,
              f = (1 << d) - 1;
          b[0] = this[c] >> d;
          for (var h = c + 1; h < this.t; ++h) b[h - c - 1] |= (this[h] & f) << e, b[h - c] = this[h] >> d;
          0 < d && (b[this.t - c - 1] |= (this.s & f) << e);
          b.t = this.t - c;
          b.clamp()
        }
      };
      e.prototype.subTo = function (a, b) {
        for (var c = 0, d = 0, e = Math.min(a.t, this.t); c < e;) d += this[c] - a[c], b[c++] = d & this.DM, d >>= this.DB;
        if (a.t < this.t) {
          for (d -= a.s; c < this.t;) d += this[c], b[c++] =
              d & this.DM, d >>= this.DB;
          d += this.s
        } else {
          for (d += this.s; c < a.t;) d -= a[c], b[c++] = d & this.DM, d >>= this.DB;
          d -= a.s
        }
        b.s = 0 > d ? -1 : 0;
        -1 > d ? b[c++] = this.DV + d : 0 < d && (b[c++] = d);
        b.t = c;
        b.clamp()
      };
      e.prototype.multiplyTo = function (a, b) {
        var c = this.abs(),
            d = a.abs(),
            k = c.t;
        for (b.t = k + d.t; 0 <= --k;) b[k] = 0;
        for (k = 0; k < d.t; ++k) b[k + c.t] = c.am(0, d[k], b, k, 0, c.t);
        b.s = 0;
        b.clamp();
        this.s != a.s && e.ZERO.subTo(b, b)
      };
      e.prototype.squareTo = function (a) {
        for (var b = this.abs(), c = a.t = 2 * b.t; 0 <= --c;) a[c] = 0;
        for (c = 0; c < b.t - 1; ++c) {
          var d = b.am(c, b[c], a, 2 * c, 0, 1);
          (a[c +
          b.t] += b.am(c + 1, 2 * b[c], a, 2 * c + 1, d, b.t - c - 1)) >= b.DV && (a[c + b.t] -= b.DV, a[c + b.t + 1] = 1)
        }
        0 < a.t && (a[a.t - 1] += b.am(c, b[c], a, 2 * c, 0, 1));
        a.s = 0;
        a.clamp()
      };
      e.prototype.divRemTo = function (a, b, c) {
        var d = a.abs();
        if (!(0 >= d.t)) {
          var k = this.abs();
          if (k.t < d.t) null != b && b.fromInt(0), null != c && this.copyTo(c);
          else {
            null == c && (c = l());
            var f = l(),
                h = this.s;
            a = a.s;
            var g = this.DB - z(d[d.t - 1]);
            0 < g ? (d.lShiftTo(g, f), k.lShiftTo(g, c)) : (d.copyTo(f), k.copyTo(c));
            d = f.t;
            k = f[d - 1];
            if (0 != k) {
              var m = k * (1 << this.F1) + (1 < d ? f[d - 2] >> this.F2 : 0),
                  p = this.FV / m,
                  m = (1 <<
                      this.F1) / m,
                  n = 1 << this.F2,
                  r = c.t,
                  t = r - d,
                  q = null == b ? l() : b;
              f.dlShiftTo(t, q);
              0 <= c.compareTo(q) && (c[c.t++] = 1, c.subTo(q, c));
              e.ONE.dlShiftTo(d, q);
              for (q.subTo(f, f); f.t < d;) f[f.t++] = 0;
              for (; 0 <= --t;) {
                var u = c[--r] == k ? this.DM : Math.floor(c[r] * p + (c[r - 1] + n) * m);
                if ((c[r] += f.am(0, u, c, t, 0, d)) < u)
                  for (f.dlShiftTo(t, q), c.subTo(q, c); c[r] < --u;) c.subTo(q, c)
              }
              null != b && (c.drShiftTo(d, b), h != a && e.ZERO.subTo(b, b));
              c.t = d;
              c.clamp();
              0 < g && c.rShiftTo(g, c);
              0 > h && e.ZERO.subTo(c, c)
            }
          }
        }
      };
      e.prototype.invDigit = function () {
        if (1 > this.t) return 0;
        var a =
            this[0];
        if (0 == (a & 1)) return 0;
        var b = a & 3,
            b = b * (2 - (a & 15) * b) & 15,
            b = b * (2 - (a & 255) * b) & 255,
            b = b * (2 - ((a & 65535) * b & 65535)) & 65535,
            b = b * (2 - a * b % this.DV) % this.DV;
        return 0 < b ? this.DV - b : -b
      };
      e.prototype.isEven = function () {
        return 0 == (0 < this.t ? this[0] & 1 : this.s)
      };
      e.prototype.exp = function (a, b) {
        if (4294967295 < a || 1 > a) return e.ONE;
        var c = l(),
            d = l(),
            k = b.convert(this),
            f = z(a) - 1;
        for (k.copyTo(c); 0 <= --f;)
          if (b.sqrTo(c, d), 0 < (a & 1 << f)) b.mulTo(d, k, c);
          else var h = c,
              c = d,
              d = h;
        return b.revert(c)
      };
      e.prototype.toString = function (a) {
        if (0 > this.s) return "-" +
            this.negate().toString(a);
        if (16 == a) a = 4;
        else if (8 == a) a = 3;
        else if (2 == a) a = 1;
        else if (32 == a) a = 5;
        else if (4 == a) a = 2;
        else return this.toRadix(a);
        var b = (1 << a) - 1,
            c, d = !1,
            e = "",
            f = this.t,
            h = this.DB - f * this.DB % a;
        if (0 < f--)
          for (h < this.DB && 0 < (c = this[f] >> h) && (d = !0, e = "0123456789abcdefghijklmnopqrstuvwxyz".charAt(c)); 0 <= f;) h < a ? (c = (this[f] & (1 << h) - 1) << a - h, c |= this[--f] >> (h += this.DB - a)) : (c = this[f] >> (h -= a) & b, 0 >= h && (h += this.DB, --f)), 0 < c && (d = !0), d && (e += "0123456789abcdefghijklmnopqrstuvwxyz".charAt(c));
        return d ? e : "0"
      };
      e.prototype.negate =
          function () {
            var a = l();
            e.ZERO.subTo(this, a);
            return a
          };
      e.prototype.abs = function () {
        return 0 > this.s ? this.negate() : this
      };
      e.prototype.compareTo = function (a) {
        var b = this.s - a.s;
        if (0 != b) return b;
        var c = this.t,
            b = c - a.t;
        if (0 != b) return b;
        for (; 0 <= --c;)
          if (0 != (b = this[c] - a[c])) return b;
        return 0
      };
      e.prototype.bitLength = function () {
        return 0 >= this.t ? 0 : this.DB * (this.t - 1) + z(this[this.t - 1] ^ this.s & this.DM)
      };
      e.prototype.mod = function (a) {
        var b = l();
        this.abs().divRemTo(a, null, b);
        0 > this.s && 0 < b.compareTo(e.ZERO) && a.subTo(b, b);
        return b
      };
      e.prototype.modPowInt = function (a, b) {
        var c;
        c = 256 > a || b.isEven() ? new u(b) : new w(b);
        return this.exp(a, c)
      };
      e.ZERO = t(0);
      e.ONE = t(1);
      v.prototype.convert = E;
      v.prototype.revert = E;
      v.prototype.mulTo = function (a, b, c) {
        a.multiplyTo(b, c)
      };
      v.prototype.sqrTo = function (a, b) {
        a.squareTo(b)
      };
      x.prototype.convert = function (a) {
        if (0 > a.s || a.t > 2 * this.m.t) return a.mod(this.m);
        if (0 > a.compareTo(this.m)) return a;
        var b = l();
        a.copyTo(b);
        this.reduce(b);
        return b
      };
      x.prototype.revert = function (a) {
        return a
      };
      x.prototype.reduce = function (a) {
        a.drShiftTo(this.m.t -
            1, this.r2);
        a.t > this.m.t + 1 && (a.t = this.m.t + 1, a.clamp());
        this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
        for (this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); 0 > a.compareTo(this.r2);) a.dAddOffset(1, this.m.t + 1);
        for (a.subTo(this.r2, a); 0 <= a.compareTo(this.m);) a.subTo(this.m, a)
      };
      x.prototype.mulTo = function (a, b, c) {
        a.multiplyTo(b, c);
        this.reduce(c)
      };
      x.prototype.sqrTo = function (a, b) {
        a.squareTo(b);
        this.reduce(b)
      };
      var p = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109,
            113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509
          ],
          J = 67108864 / p[p.length - 1];
      e.prototype.chunkSize = function (a) {
        return Math.floor(Math.LN2 * this.DB / Math.log(a))
      };
      e.prototype.toRadix = function (a) {
        null == a && (a = 10);
        if (0 == this.signum() || 2 > a || 36 < a) return "0";
        var b = this.chunkSize(a),
            b = Math.pow(a,
                b),
            c = t(b),
            d = l(),
            e = l(),
            f = "";
        for (this.divRemTo(c, d, e); 0 < d.signum();) f = (b + e.intValue()).toString(a).substr(1) + f, d.divRemTo(c, d, e);
        return e.intValue().toString(a) + f
      };
      e.prototype.fromRadix = function (a, b) {
        this.fromInt(0);
        null == b && (b = 10);
        for (var c = this.chunkSize(b), d = Math.pow(b, c), k = !1, f = 0, h = 0, g = 0; g < a.length; ++g) {
          var l = B(a, g);
          0 > l ? "-" == a.charAt(g) && 0 == this.signum() && (k = !0) : (h = b * h + l, ++f >= c && (this.dMultiply(d), this.dAddOffset(h, 0), h = f = 0))
        }
        0 < f && (this.dMultiply(Math.pow(b, f)), this.dAddOffset(h, 0));
        k && e.ZERO.subTo(this,
            this)
      };
      e.prototype.fromNumber = function (a, b, c) {
        if ("number" == typeof b)
          if (2 > a) this.fromInt(1);
          else
            for (this.fromNumber(a, c), this.testBit(a - 1) || this.bitwiseTo(e.ONE.shiftLeft(a - 1), A, this), this.isEven() && this.dAddOffset(1, 0); !this.isProbablePrime(b);) this.dAddOffset(2, 0), this.bitLength() > a && this.subTo(e.ONE.shiftLeft(a - 1), this);
        else {
          c = [];
          var d = a & 7;
          c.length = (a >> 3) + 1;
          b.nextBytes(c);
          c[0] = 0 < d ? c[0] & (1 << d) - 1 : 0;
          this.fromString(c, 256)
        }
      };
      e.prototype.bitwiseTo = function (a, b, c) {
        var d, e, f = Math.min(a.t, this.t);
        for (d =
                 0; d < f; ++d) c[d] = b(this[d], a[d]);
        if (a.t < this.t) {
          e = a.s & this.DM;
          for (d = f; d < this.t; ++d) c[d] = b(this[d], e);
          c.t = this.t
        } else {
          e = this.s & this.DM;
          for (d = f; d < a.t; ++d) c[d] = b(e, a[d]);
          c.t = a.t
        }
        c.s = b(this.s, a.s);
        c.clamp()
      };
      e.prototype.changeBit = function (a, b) {
        var c = e.ONE.shiftLeft(a);
        this.bitwiseTo(c, b, c);
        return c
      };
      e.prototype.addTo = function (a, b) {
        for (var c = 0, d = 0, e = Math.min(a.t, this.t); c < e;) d += this[c] + a[c], b[c++] = d & this.DM, d >>= this.DB;
        if (a.t < this.t) {
          for (d += a.s; c < this.t;) d += this[c], b[c++] = d & this.DM, d >>= this.DB;
          d += this.s
        } else {
          for (d +=
                   this.s; c < a.t;) d += a[c], b[c++] = d & this.DM, d >>= this.DB;
          d += a.s
        }
        b.s = 0 > d ? -1 : 0;
        0 < d ? b[c++] = d : -1 > d && (b[c++] = this.DV + d);
        b.t = c;
        b.clamp()
      };
      e.prototype.dMultiply = function (a) {
        this[this.t] = this.am(0, a - 1, this, 0, 0, this.t);
        ++this.t;
        this.clamp()
      };
      e.prototype.dAddOffset = function (a, b) {
        if (0 != a) {
          for (; this.t <= b;) this[this.t++] = 0;
          for (this[b] += a; this[b] >= this.DV;) this[b] -= this.DV, ++b >= this.t && (this[this.t++] = 0), ++this[b]
        }
      };
      e.prototype.multiplyLowerTo = function (a, b, c) {
        var d = Math.min(this.t + a.t, b);
        c.s = 0;
        for (c.t = d; 0 < d;) c[--d] =
            0;
        var e;
        for (e = c.t - this.t; d < e; ++d) c[d + this.t] = this.am(0, a[d], c, d, 0, this.t);
        for (e = Math.min(a.t, b); d < e; ++d) this.am(0, a[d], c, d, 0, b - d);
        c.clamp()
      };
      e.prototype.multiplyUpperTo = function (a, b, c) {
        --b;
        var d = c.t = this.t + a.t - b;
        for (c.s = 0; 0 <= --d;) c[d] = 0;
        for (d = Math.max(b - this.t, 0); d < a.t; ++d) c[this.t + d - b] = this.am(b - d, a[d], c, 0, 0, this.t + d - b);
        c.clamp();
        c.drShiftTo(1, c)
      };
      e.prototype.modInt = function (a) {
        if (0 >= a) return 0;
        var b = this.DV % a,
            c = 0 > this.s ? a - 1 : 0;
        if (0 < this.t)
          if (0 == b) c = this[0] % a;
          else
            for (var d = this.t - 1; 0 <= d; --d) c = (b *
                c + this[d]) % a;
        return c
      };
      e.prototype.millerRabin = function (a) {
        var b = this.subtract(e.ONE),
            c = b.getLowestSetBit();
        if (0 >= c) return !1;
        var d = b.shiftRight(c);
        a = a + 1 >> 1;
        a > p.length && (a = p.length);
        for (var k = l(), f = 0; f < a; ++f) {
          k.fromInt(p[f]);
          var h = k.modPow(d, this);
          if (0 != h.compareTo(e.ONE) && 0 != h.compareTo(b)) {
            for (var g = 1; g++ < c && 0 != h.compareTo(b);)
              if (h = h.modPowInt(2, this), 0 == h.compareTo(e.ONE)) return !1;
            if (0 != h.compareTo(b)) return !1
          }
        }
        return !0
      };
      e.prototype.clone = function () {
        var a = l();
        this.copyTo(a);
        return a
      };
      e.prototype.intValue =
          function () {
            if (0 > this.s) {
              if (1 == this.t) return this[0] - this.DV;
              if (0 == this.t) return -1
            } else {
              if (1 == this.t) return this[0];
              if (0 == this.t) return 0
            }
            return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0]
          };
      e.prototype.byteValue = function () {
        return 0 == this.t ? this.s : this[0] << 24 >> 24
      };
      e.prototype.shortValue = function () {
        return 0 == this.t ? this.s : this[0] << 16 >> 16
      };
      e.prototype.signum = function () {
        return 0 > this.s ? -1 : 0 >= this.t || 1 == this.t && 0 >= this[0] ? 0 : 1
      };
      e.prototype.toByteArray = function () {
        var a = this.t,
            b = [];
        b[0] = this.s;
        var c = this.DB -
            a * this.DB % 8,
            d, e = 0;
        if (0 < a--)
          for (c < this.DB && (d = this[a] >> c) != (this.s & this.DM) >> c && (b[e++] = d | this.s << this.DB - c); 0 <= a;)
            if (8 > c ? (d = (this[a] & (1 << c) - 1) << 8 - c, d |= this[--a] >> (c += this.DB - 8)) : (d = this[a] >> (c -= 8) & 255, 0 >= c && (c += this.DB, --a)), 0 != (d & 128) && (d |= -256), 0 == e && (this.s & 128) != (d & 128) && ++e, 0 < e || d != this.s) b[e++] = d;
        return b
      };
      e.prototype.equals = function (a) {
        return 0 == this.compareTo(a)
      };
      e.prototype.min = function (a) {
        return 0 > this.compareTo(a) ? this : a
      };
      e.prototype.max = function (a) {
        return 0 < this.compareTo(a) ? this : a
      };
      e.prototype.and =
          function (a) {
            var b = l();
            this.bitwiseTo(a, I, b);
            return b
          };
      e.prototype.or = function (a) {
        var b = l();
        this.bitwiseTo(a, A, b);
        return b
      };
      e.prototype.xor = function (a) {
        var b = l();
        this.bitwiseTo(a, C, b);
        return b
      };
      e.prototype.andNot = function (a) {
        var b = l();
        this.bitwiseTo(a, D, b);
        return b
      };
      e.prototype.not = function () {
        for (var a = l(), b = 0; b < this.t; ++b) a[b] = this.DM & ~this[b];
        a.t = this.t;
        a.s = ~this.s;
        return a
      };
      e.prototype.shiftLeft = function (a) {
        var b = l();
        0 > a ? this.rShiftTo(-a, b) : this.lShiftTo(a, b);
        return b
      };
      e.prototype.shiftRight = function (a) {
        var b =
            l();
        0 > a ? this.lShiftTo(-a, b) : this.rShiftTo(a, b);
        return b
      };
      e.prototype.getLowestSetBit = function () {
        for (var a = 0; a < this.t; ++a)
          if (0 != this[a]) {
            var b = a * this.DB;
            a = this[a];
            if (0 == a) a = -1;
            else {
              var c = 0;
              0 == (a & 65535) && (a >>= 16, c += 16);
              0 == (a & 255) && (a >>= 8, c += 8);
              0 == (a & 15) && (a >>= 4, c += 4);
              0 == (a & 3) && (a >>= 2, c += 2);
              0 == (a & 1) && ++c;
              a = c
            }
            return b + a
          }
        return 0 > this.s ? this.t * this.DB : -1
      };
      e.prototype.bitCount = function () {
        for (var a = 0, b = this.s & this.DM, c = 0; c < this.t; ++c) {
          for (var d = this[c] ^ b, e = 0; 0 != d;) d &= d - 1, ++e;
          a += e
        }
        return a
      };
      e.prototype.testBit =
          function (a) {
            var b = Math.floor(a / this.DB);
            return b >= this.t ? 0 != this.s : 0 != (this[b] & 1 << a % this.DB)
          };
      e.prototype.setBit = function (a) {
        return this.changeBit(a, A)
      };
      e.prototype.clearBit = function (a) {
        return this.changeBit(a, D)
      };
      e.prototype.flipBit = function (a) {
        return this.changeBit(a, C)
      };
      e.prototype.add = function (a) {
        var b = l();
        this.addTo(a, b);
        return b
      };
      e.prototype.subtract = function (a) {
        var b = l();
        this.subTo(a, b);
        return b
      };
      e.prototype.multiply = function (a) {
        var b = l();
        this.multiplyTo(a, b);
        return b
      };
      e.prototype.divide = function (a) {
        var b =
            l();
        this.divRemTo(a, b, null);
        return b
      };
      e.prototype.remainder = function (a) {
        var b = l();
        this.divRemTo(a, null, b);
        return b
      };
      e.prototype.divideAndRemainder = function (a) {
        var b = l(),
            c = l();
        this.divRemTo(a, b, c);
        return [b, c]
      };
      e.prototype.modPow = function (a, b) {
        var c = a.bitLength(),
            d, e = t(1),
            f;
        if (0 >= c) return e;
        d = 18 > c ? 1 : 48 > c ? 3 : 144 > c ? 4 : 768 > c ? 5 : 6;
        f = 8 > c ? new u(b) : b.isEven() ? new x(b) : new w(b);
        var h = [],
            g = 3,
            m = d - 1,
            p = (1 << d) - 1;
        h[1] = f.convert(this);
        if (1 < d)
          for (c = l(), f.sqrTo(h[1], c); g <= p;) h[g] = l(), f.mulTo(c, h[g - 2], h[g]), g += 2;
        for (var n =
            a.t - 1, r, v = !0, q = l(), c = z(a[n]) - 1; 0 <= n;) {
          c >= m ? r = a[n] >> c - m & p : (r = (a[n] & (1 << c + 1) - 1) << m - c, 0 < n && (r |= a[n - 1] >> this.DB + c - m));
          for (g = d; 0 == (r & 1);) r >>= 1, --g;
          0 > (c -= g) && (c += this.DB, --n);
          if (v) h[r].copyTo(e), v = !1;
          else {
            for (; 1 < g;) f.sqrTo(e, q), f.sqrTo(q, e), g -= 2;
            0 < g ? f.sqrTo(e, q) : (g = e, e = q, q = g);
            f.mulTo(q, h[r], e)
          }
          for (; 0 <= n && 0 == (a[n] & 1 << c);) f.sqrTo(e, q), g = e, e = q, q = g, 0 > --c && (c = this.DB - 1, --n)
        }
        return f.revert(e)
      };
      e.prototype.modInverse = function (a) {
        var b = a.isEven();
        if (this.isEven() && b || 0 == a.signum()) return e.ZERO;
        for (var c = a.clone(),
                 d = this.clone(), k = t(1), f = t(0), h = t(0), g = t(1); 0 != c.signum();) {
          for (; c.isEven();) c.rShiftTo(1, c), b ? (k.isEven() && f.isEven() || (k.addTo(this, k), f.subTo(a, f)), k.rShiftTo(1, k)) : f.isEven() || f.subTo(a, f), f.rShiftTo(1, f);
          for (; d.isEven();) d.rShiftTo(1, d), b ? (h.isEven() && g.isEven() || (h.addTo(this, h), g.subTo(a, g)), h.rShiftTo(1, h)) : g.isEven() || g.subTo(a, g), g.rShiftTo(1, g);
          0 <= c.compareTo(d) ? (c.subTo(d, c), b && k.subTo(h, k), f.subTo(g, f)) : (d.subTo(c, d), b && h.subTo(k, h), g.subTo(f, g))
        }
        if (0 != d.compareTo(e.ONE)) return e.ZERO;
        if (0 <= g.compareTo(a)) return g.subtract(a);
        if (0 > g.signum()) g.addTo(a, g);
        else return g;
        return 0 > g.signum() ? g.add(a) : g
      };
      e.prototype.pow = function (a) {
        return this.exp(a, new v)
      };
      e.prototype.gcd = function (a) {
        var b = 0 > this.s ? this.negate() : this.clone();
        a = 0 > a.s ? a.negate() : a.clone();
        if (0 > b.compareTo(a)) {
          var c = b,
              b = a;
          a = c
        }
        var c = b.getLowestSetBit(),
            d = a.getLowestSetBit();
        if (0 > d) return b;
        c < d && (d = c);
        0 < d && (b.rShiftTo(d, b), a.rShiftTo(d, a));
        for (; 0 < b.signum();) 0 < (c = b.getLowestSetBit()) && b.rShiftTo(c, b), 0 < (c = a.getLowestSetBit()) &&
        a.rShiftTo(c, a), 0 <= b.compareTo(a) ? (b.subTo(a, b), b.rShiftTo(1, b)) : (a.subTo(b, a), a.rShiftTo(1, a));
        0 < d && a.lShiftTo(d, a);
        return a
      };
      e.prototype.isProbablePrime = function (a) {
        var b, c = this.abs();
        if (1 == c.t && c[0] <= p[p.length - 1]) {
          for (b = 0; b < p.length; ++b)
            if (c[0] == p[b]) return !0;
          return !1
        }
        if (c.isEven()) return !1;
        for (b = 1; b < p.length;) {
          for (var d = p[b], e = b + 1; e < p.length && d < J;) d *= p[e++];
          for (d = c.modInt(d); b < e;)
            if (0 == d % p[b++]) return !1
        }
        return c.millerRabin(a)
      };
      return {
        BigInteger: e
      }
    }()
    BigInteger = BigInteger.BigInteger;

export var BigInteger;
