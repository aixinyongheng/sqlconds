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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-var-requires
// const sqlstring = require("./utils/sqlstring");
var basesqlConds_1 = __importDefault(require("./basesqlConds"));
/**
 * todo 1.防止sql注入s
 *      2.eslint配置
 *      3.通用统计sql组织
 */
var MysqlConds = /** @class */ (function (_super) {
    __extends(MysqlConds, _super);
    // private _flag;
    // private _mode;
    /**
     * 构造函数
     * @param flag 数据库类型  [postgres/mysql/oracle/...]
     */
    function MysqlConds(flag, _a) {
        if (flag === void 0) { flag = 'mysql'; }
        var _b = _a === void 0 ? { mode: 'default' } : _a, _c = _b.mode, mode = _c === void 0 ? 'default' : _c;
        // this._flag = flag;
        // this._mode = mode;
        return _super.call(this, flag, { mode: mode }) || this;
    }
    MysqlConds.prototype.dealdifferentItemvalue = function (_a) {
        var conditem = _a.conditem, rntable = _a.rntable;
        var itemvalue = (conditem.value || conditem.value == '0') ? "'".concat(conditem.value, "'") : '';
        return itemvalue;
    };
    MysqlConds.prototype.dealdifferentConds = function (conditem, conditemFieldReset, itemvalue) {
        var condstr = '';
        // todo 
        condstr = " ".concat(conditemFieldReset, " ").concat(this.RelationSign[conditem.operator.toUpperCase()], "  ").concat(itemvalue, " ");
        return condstr;
    };
    return MysqlConds;
}(basesqlConds_1.default));
exports.default = MysqlConds;
