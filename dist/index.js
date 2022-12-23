"use strict";
var Sqlconds = /** @class */ (function () {
    function Sqlconds(flag) {
        this.flag = flag;
    }
    Sqlconds.prototype.condPackage = function (conds, rntable) {
        if (!conds || conds === '') {
            return { cond: '', order: '' };
        }
        var rntalbeflag = '';
        if (rntable) {
            if (rntable.indexOf('"') >= 0) {
                rntalbeflag = "".concat(rntable, ".");
            }
            else {
                rntalbeflag = "\"".concat(rntable, "\".");
            }
        }
        conds = typeof conds === 'string' ? JSON.parse(conds) : conds;
        var result = { cond: '', order: '' };
        var sqlRes = this._condstostr({ conds: conds, rntable: rntalbeflag });
        result.cond = 'and ' + sqlRes.condsstr;
        if (sqlRes.orderstr) {
            result.order = 'order by ' + sqlRes.orderstr;
        }
        else {
            result.order = '';
        }
        console.log(result);
        return result;
    };
    Sqlconds.prototype._condstostr = function (_a) {
        var conds = _a.conds, rntable = _a.rntable;
        var result = {};
        var condsstr = '';
        var orderstr = '';
        if (conds.length === 0) {
            return { condsstr: ' ( 1=1 ) ', orderstr: orderstr };
        }
        condsstr += '  (';
        for (var index = 0; index < conds.length; index++) { // for  in  有问题
            var item = conds[index];
            if (+index !== 0) { // 非首个条件，增加连接符 and/or
                condsstr += " ".concat(item.whereLinker ? item.whereLinker : 'and', " ");
            }
            // 排序的后面提出来，目前兼容下之前的传参
            if (item.operator === 'OBA' || item.operator === 'OBD' || item.operator === 'OB') {
                condsstr += ' 1 = 1 ';
                if (orderstr) { // 排序已有值，增加连接符 ,
                    orderstr += ' , ';
                }
                if (item.operator === 'OBD') { // 如果最后一个是排序，则闭环
                    orderstr += "  ".concat(rntable, "\"").concat(item.field, "\" desc  ");
                }
                else if (item.operator === 'OB') { // 如果最后一个是排序，则闭环
                    orderstr += "    field(".concat(rntable, "\"").concat(item.field, "\",").concat(item.value, ")   ");
                }
                else if (item.operator === 'OBA') { // 如果最后一个是排序，则闭环
                    orderstr += "   ".concat(rntable, "\"").concat(item.field, "\"  asc  ");
                }
            }
            else {
                condsstr += this._formatCondsql({ conditem: item, rntable: rntable });
            }
            if (item.condition && item.condition.length > 0) {
                var condRes = this._condstostr({ conds: item.condition, rntable: rntable });
                condsstr += " ".concat(item.whereLinkerCondition ? item.whereLinkerCondition : 'and', "  ").concat(condRes.condsstr, " ");
                if (orderstr) {
                    orderstr += ",".concat(condRes.orderstr);
                }
                else {
                    orderstr += condRes.orderstr;
                }
            }
        }
        condsstr += ')';
        result.condsstr = condsstr;
        result.orderstr = orderstr;
        return result;
    };
    // 条件转换
    Sqlconds.prototype._formatCondsql = function (_a) {
        var conditem = _a.conditem, rntable = _a.rntable;
        var RelationSign = {
            EQ: ' = ', EQN: ' != ', EQ_D: ' = ', GT: ' > ', LT: ' < ', GTE: ' >= ', LTE: ' <= ', FQ: ' like ', NFQ: ' not like ', FQL: ' like ', FQR: ' like ', INULL: ' is null ', INNULL: ' is not null ', IN: ' in ', INN: ' not in ', BTN: ' between ', OBA: ' order by ', OBD: ' order by  ', OB: ' order by  ', JSONIN: ' ? ', GEOMINTER: '=', GEOMNOTINTER: '=',
        };
        var condstr = '';
        var conditemFieldReset = " ".concat(rntable, "\"").concat(conditem.field, "\" ");
        if (conditem.fun) {
            conditemFieldReset = " ".concat(conditem.fun, "(").concat(rntable, "\"").concat(conditem.field, "\") ");
        }
        // 内容值处理
        var itemvalue = '';
        if (conditem.operator === 'FQ' || conditem.operator === 'NFQ') {
            itemvalue = conditem.value ? " '%".concat(conditem.value, "%' ") : '%%';
        }
        else if (conditem.operator === 'FQL') {
            itemvalue = conditem.value ? " '%".concat(conditem.value, "' ") : '%';
        }
        else if (conditem.operator === 'FQR') {
            itemvalue = conditem.value ? " '".concat(conditem.value, "%' ") : '%';
        }
        else if (conditem.operator === 'IN') {
            itemvalue = "('".concat(conditem.value.split(',').join('\',\''), "')");
        }
        else if (conditem.operator === 'INN') {
            itemvalue = "('".concat(conditem.value.split(',').join('\',\''), "')");
        }
        else if (conditem.operator === 'BTN') {
            itemvalue = "'".concat(conditem.value.split(',').join('\' and  \''), "'");
        }
        else if (conditem.operator === 'GEOMINTER' || conditem.operator === 'GEOMNOTINTER') {
            itemvalue = '';
        }
        else {
            itemvalue = (conditem.value || conditem.value == '0') ? "'".concat(conditem.value, "'") : '';
        }
        //  条件处理
        if (conditem.operator === 'GEOMINTER' || conditem.operator === 'GEOMNOTINTER') {
            condstr += " st_intersects(".concat(conditemFieldReset, ", st_setsrid(st_geomfromgeojson('").concat(typeof conditem.value === 'object' ? JSON.stringify(conditem.value) : conditem.value, "'),4490)) ").concat(RelationSign[conditem.operator], "  ").concat(conditem.operator === 'GEOMINTER' ? 'true' : 'false', " ");
        }
        else {
            condstr += " ".concat(conditemFieldReset, " ").concat(RelationSign[conditem.operator], "  ").concat(itemvalue, " ");
        }
        return condstr;
    };
    return Sqlconds;
}());
module.exports = Sqlconds;
