"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-var-requires
// const sqlstring = require("./utils/sqlstring");
var basesqlConds_1 = __importDefault(require("./basesqlConds"));
/**
 * todo 1.防止sql注入
 *      2.eslint配置
 *      3.通用统计sql组织
 */
var Postgresconds = /** @class */ (function (_super) {
    __extends(Postgresconds, _super);
    /**
     * 构造函数
     * @param flag 数据库类型  [postgres/mysql/oracle/...]
     */
    function Postgresconds(flag, _a) {
        if (flag === void 0) { flag = 'postgres'; }
        var _b = _a === void 0 ? { mode: 'default' } : _a, _c = _b.mode, mode = _c === void 0 ? 'default' : _c;
        var _this = 
        // this._flag = flag;
        // this._mode = mode;
        _super.call(this, flag, { mode: mode }) || this;
        // private _flag;
        // private _mode;
        _this.relationsign_pg = { JSONIN: ' ? ', GEOMINTER: '=', GEOMNOTINTER: '=' };
        _this.RelationSign = __assign(__assign({}, _this.RelationSign), _this.relationsign_pg);
        return _this;
    }
    // postgres条件值特殊处理
    Postgresconds.prototype.dealdifferentItemvalue = function (_a) {
        var conditem = _a.conditem, rntable = _a.rntable;
        var itemvalue = '';
        if (conditem.operator.toUpperCase() === 'GEOMINTER' || conditem.operator.toUpperCase() === 'GEOMNOTINTER') {
            itemvalue = '';
        }
        else {
            itemvalue = (conditem.value || conditem.value == '0') ? "'".concat(conditem.value, "'") : '';
        }
        return itemvalue;
    };
    //  postgres特有条件拼接特殊处理
    Postgresconds.prototype.dealdifferentConds = function (conditem, conditemFieldReset, itemvalue) {
        var condstr = '';
        if (conditem.operator.toUpperCase() === 'GEOMINTER' || conditem.operator.toUpperCase() === 'GEOMNOTINTER') {
            console.log(" ".concat(JSON.stringify(this.RelationSign), " \n      ").concat(conditem.operator, "\n       ").concat(this.RelationSign[conditem.operator]));
            condstr = " st_intersects(".concat(conditemFieldReset, ", st_setsrid(st_geomfromgeojson('").concat(typeof conditem.value === 'object' ? JSON.stringify(conditem.value) : conditem.value, "'),4490)) ").concat(this.RelationSign[conditem.operator], "  ").concat(conditem.operator === 'GEOMINTER' ? 'true' : 'false', " ");
        }
        else {
            condstr = " ".concat(conditemFieldReset, " ").concat(this.RelationSign[conditem.operator.toUpperCase()], "  ").concat(itemvalue, " ");
        }
        return condstr;
    };
    return Postgresconds;
}(basesqlConds_1.default));
exports.default = Postgresconds;
