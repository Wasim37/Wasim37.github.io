"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Wrapper_js_1 = require("../Wrapper.js");
var msqrt_js_1 = require("../../common/Wrappers/msqrt.js");
var msqrt_js_2 = require("../../../core/MmlTree/MmlNodes/msqrt.js");
var SVGmsqrt = (function (_super) {
    __extends(SVGmsqrt, _super);
    function SVGmsqrt() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dx = 0;
        return _this;
    }
    SVGmsqrt.prototype.toSVG = function (parent) {
        var surd = this.childNodes[this.surd];
        var base = this.childNodes[this.base];
        var root = (this.root ? this.childNodes[this.root] : null);
        var rbox = this.getBBox();
        var sbox = surd.getBBox();
        var bbox = base.getBBox();
        var _a = __read(this.getPQ(sbox), 2), p = _a[0], q = _a[1];
        var t = this.font.params.rule_thickness * this.bbox.scale;
        var H = bbox.h + q + t;
        var SVG = this.standardSVGnode(parent);
        var BASE = this.adaptor.append(SVG, this.svg('g'));
        this.addRoot(SVG, root, sbox, H);
        surd.toSVG(SVG);
        surd.place(this.dx, rbox.h - sbox.h - t);
        base.toSVG(BASE);
        base.place(this.dx + sbox.w, 0);
        var RULE = this.adaptor.append(SVG, this.svg('rect', {
            width: this.fixed(bbox.w), height: this.fixed(t),
            x: this.fixed(this.dx + sbox.w), y: this.fixed(rbox.h - 2 * t)
        }));
    };
    SVGmsqrt.prototype.addRoot = function (ROOT, root, sbox, H) {
    };
    SVGmsqrt.kind = msqrt_js_2.MmlMsqrt.prototype.kind;
    return SVGmsqrt;
}(msqrt_js_1.CommonMsqrtMixin(Wrapper_js_1.SVGWrapper)));
exports.SVGmsqrt = SVGmsqrt;
//# sourceMappingURL=msqrt.js.map