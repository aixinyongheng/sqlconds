"use strict";
/**
 * todo 1.防止sql注入
 *      2.eslint配置
 *      3.通用统计sql组织
 */
var Sqlconds = /** @class */ (function () {
    /**
     * 构造函数
     * @param flag 数据库类型  [postgres/mysql/oracle/...]
     */
    function Sqlconds(flag) {
        this.flag = flag;
    }
    /**
     *
     * @param conds 查询条件
     * @param rntable 表名
     * @returns
     */
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
    /**
     * 通用统计-通用分组条件组织
     * @param condObj 分组字段条件 1.支持字段名,分隔 2.支持[{ "type":"CG", "field":"field1", "rename":"newfield1" }]
     * @returns
     */
    Sqlconds.prototype.groupCondPackage = function (condObj) {
        var groupObj = {
            groupbyconds: '',
            fields: '1',
        };
        if (!condObj || condObj === '') {
            return groupObj;
        }
        var groupConds = function (_a) {
            var type = _a.type, field = _a.field, rename = _a.rename;
            field = field && field.replace(/\\/g, '\\').replace(/'/g, '\'\'').replace(/-/g, '');
            rename = rename && rename.replace(/\\/g, '\\').replace(/'/g, '\'\'').replace(/-/g, '');
            var types = {
                CG: "\"".concat(field, "\""), SUB: "substring(".concat(field, ")"),
            };
            return {
                cond: types[type],
                field: "".concat(types[type], " ").concat(rename ? "AS \"".concat(rename, "\"") : ''),
            };
        };
        if ((typeof condObj == 'string' && condObj.trim().indexOf("[") == 0) || typeof condObj == 'object') { // 传参为array或者array的字符串格式
            var condArr = typeof condObj === 'string' ? JSON.parse(condObj) : condObj;
            var conds_1 = [], fields_1 = [];
            console.log(condArr);
            condArr.forEach(function (_cond) {
                var _a = groupConds(_cond), cond = _a.cond, field = _a.field;
                conds_1.push(cond);
                fields_1.push(field);
            });
            groupObj = {
                groupbyconds: ' group by ' + conds_1.join(',') + ' ',
                fields: " " + fields_1.join(',') + " ",
            };
        }
        else { // 传参为,分隔的字段
            var condstr = condObj;
            groupObj.groupbyconds = " group by \"".concat(condstr.split(',').join('","'), "\" ");
            groupObj.fields = " \"".concat(condstr.split(',').join('","'), "\" ");
        }
        return groupObj;
    };
    /**
     * 通用统计-统计条件聚合函数组织
     * @param conds 通用统计-统计条件聚合函数组织
     * @returns
     */
    Sqlconds.prototype.statisCondPackage = function (conds) {
        // 过滤 '[]'空数组
        if (!conds || conds === '' || conds === '[]') {
            return { statiscond: '' };
        }
        conds = typeof conds === 'string' ? JSON.parse(conds) : conds;
        var result = { statiscond: '' };
        var sqlconds = [[], []];
        this._statisCondPackage(conds, sqlconds);
        result.statiscond = " ".concat(sqlconds[0].join(','), " ");
        return result;
    };
    Sqlconds.prototype._statisCondPackage = function (conds, sqlconds) {
        var RelationSign = function (key, field, typecast) {
            var _ = {
                // 1.type 当type = 'ZDY' 自定义，可以将aggSign传以下可以进行optSign操作的聚合函数，可实现【sum(zd1) + sum(zd2)... || max(zd1) * max(zd2)... || avg(zd1) + avg(zd2)... ...】,即实现多个字段的统计基础上的加减乘除操作
                ZDZ: "max(\"".concat(field, "\"").concat(typecast, ")"), ZXZ: "min(\"".concat(field, "\"").concat(typecast, ")"), PJZ: "avg(\"".concat(field, "\"").concat(typecast, ")"), BZC: "stddev_pop(\"".concat(field, "\"").concat(typecast, ")"), FC: "var_pop(\"".concat(field, "\"").concat(typecast, ")"),
                QH: "sum(\"".concat(field, "\"").concat(typecast, ")"), STR: "string_agg(\"".concat(field, "\"::varchar, ',')"), ARR: "array_agg(\"".concat(field, "\"").concat(typecast, ")"),
                // optSign 运算操作符
                JIA: '+', JIAN: '-', CHENG: '*', CHU: '/',
            };
            return _[key];
        };
        var index = 0;
        var _loop_1 = function (item) {
            index++;
            var aggObj = '';
            // 支持多个字段sum(zd1) + sum(zd2)... || max(zd1) * max(zd2)... || avg(zd1) + avg(zd2)... ...
            if (item.type === 'ZDY' && item.aggSign && item.optSign) {
                var fieldArr = item.field && item.field.split(',') || [];
                var fieldList_1 = [];
                fieldArr.forEach(function (field) {
                    if (item.typecast) {
                        fieldList_1.push("".concat(RelationSign(item.aggSign, field, '::' + item.typecast)));
                    }
                    else {
                        fieldList_1.push("".concat(RelationSign(item.aggSign, field, '')));
                    }
                });
                aggObj = fieldList_1.join(RelationSign(item.optSign));
            }
            else {
                if (item.typecast) {
                    aggObj = "".concat(RelationSign(item.type, item.field, '::' + item.typecast));
                }
                else {
                    aggObj = "".concat(RelationSign(item.type, item.field, ''));
                }
            }
            if (item.dpoint) {
                sqlconds[0].push("round(".concat(aggObj, ",").concat(item.dpoint, ") AS \"").concat(item.rename, "\" "));
            }
            else {
                sqlconds[0].push("".concat(aggObj, " AS \"").concat(item.rename, "\""));
            }
        };
        for (var _i = 0, conds_2 = conds; _i < conds_2.length; _i++) {
            var item = conds_2[_i];
            _loop_1(item);
        }
    };
    return Sqlconds;
}());
module.exports = Sqlconds;
