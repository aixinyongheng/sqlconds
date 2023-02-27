"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * todo 1.防止sql注入
 *      2.eslint配置
 *      3.通用统计sql组织
 */
var BasesqlConds = /** @class */ (function () {
    /**
     * 构造函数
     * @param flag 数据库类型  [postgres/mysql/oracle/...]
     */
    function BasesqlConds(flag, _a) {
        if (flag === void 0) { flag = 'postgres'; }
        var _b = _a === void 0 ? { mode: 'default' } : _a, _c = _b.mode, mode = _c === void 0 ? 'default' : _c;
        // 通用数据库占位转换sql枚举，不同数据库的差异放到不同的实例中增加
        this.RelationSign = {
            EQ: ' = ', EQN: ' != ', EQ_D: ' = ', GT: ' > ', LT: ' < ', GTE: ' >= ', LTE: ' <= ', FQ: ' like ', NFQ: ' not like ', FQL: ' like ', FQR: ' like ', INULL: ' is null ', INNULL: ' is not null ', IN: ' in ', INN: ' not in ', BTN: ' between ', OBA: ' order by ', OBD: ' order by  ', OB: ' order by  '
        };
        this._flag = flag;
        this._mode = mode;
    }
    /**
     *
     * @param conds 查询条件
     * @param rntable 表名
     * @returns
     */
    BasesqlConds.prototype.condPackage = function (conds, rntable) {
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
    BasesqlConds.prototype._condstostr = function (_a) {
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
            // 校验参数是否正确/防止sql注入处理
            if (!this.RelationSign[item.operator.toUpperCase()]) {
                throw new Error("\u53C2\u6570\u6821\u9A8C\u5931\u8D25\u3002".concat(this._flag, "\u4E0D\u5B58\u5728\u53C2\u6570 item.operator:  ").concat(item.operator));
            }
            if (+index !== 0) { // 非首个条件，增加连接符 and/or
                condsstr += " ".concat(item.whereLinker ? item.whereLinker : 'and', " ");
            }
            // 排序的后面提出来，目前兼容下之前的传参
            if (item.operator.toUpperCase() === 'OBA' || item.operator.toUpperCase() === 'OBD' || item.operator.toUpperCase() === 'OB') {
                condsstr += ' 1 = 1 ';
                if (orderstr) { // 排序已有值，增加连接符 ,
                    orderstr += ' , ';
                }
                if (item.operator.toUpperCase() === 'OBD') { // 如果最后一个是排序，则闭环
                    orderstr += "  ".concat(rntable, "\"").concat(item.field, "\" desc  ");
                }
                else if (item.operator.toUpperCase() === 'OB') { // 如果最后一个是排序，则闭环
                    orderstr += "    field(".concat(rntable, "\"").concat(item.field, "\",").concat(item.value, ")   ");
                }
                else if (item.operator.toUpperCase() === 'OBA') { // 如果最后一个是排序，则闭环
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
    BasesqlConds.prototype._formatCondsql = function (_a) {
        // 首先检验，如果参数异常，报错
        var conditem = _a.conditem, rntable = _a.rntable;
        var condstr = '';
        var conditemFieldReset = " ".concat(rntable, "\"").concat(conditem.field, "\" ");
        if (conditem.fun) {
            conditemFieldReset = " ".concat(conditem.fun, "(").concat(rntable, "\"").concat(conditem.field, "\") ");
        }
        // 内容值处理
        var itemvalue = '';
        if (conditem.operator.toUpperCase() === 'FQ' || conditem.operator.toUpperCase() === 'NFQ') {
            itemvalue = conditem.value ? " '%".concat(conditem.value, "%' ") : '%%';
        }
        else if (conditem.operator.toUpperCase() === 'FQL') {
            itemvalue = conditem.value ? " '%".concat(conditem.value, "' ") : '%';
        }
        else if (conditem.operator.toUpperCase() === 'FQR') {
            itemvalue = conditem.value ? " '".concat(conditem.value, "%' ") : '%';
        }
        else if (conditem.operator.toUpperCase() === 'IN') {
            itemvalue = "('".concat(conditem.value.split(',').join('\',\''), "')");
        }
        else if (conditem.operator.toUpperCase() === 'INN') {
            itemvalue = "('".concat(conditem.value.split(',').join('\',\''), "')");
        }
        else if (conditem.operator.toUpperCase() === 'BTN') {
            itemvalue = "'".concat(conditem.value.split(',').join('\' and  \''), "'");
            // } else if (conditem.operator.toUpperCase() === 'GEOMINTER' || conditem.operator.toUpperCase() === 'GEOMNOTINTER') {
            // itemvalue = '';
        }
        else {
            itemvalue = this.dealdifferentItemvalue({ conditem: conditem, rntable: rntable });
            itemvalue = (conditem.value || conditem.value == '0') ? "'".concat(conditem.value, "'") : '';
        }
        //  条件处理
        // if (conditem.operator.toUpperCase() === 'GEOMINTER' || conditem.operator.toUpperCase() === 'GEOMNOTINTER') {
        //   console.log(` ${JSON.stringify(this.RelationSign)} 
        //   ${conditem.operator}
        //    ${this.RelationSign[conditem.operator]}`);
        //   condstr += ` st_intersects(${conditemFieldReset}, st_setsrid(st_geomfromgeojson('${typeof conditem.value === 'object' ? JSON.stringify(conditem.value) : conditem.value}'),4490)) ${this.RelationSign[conditem.operator]}  ${conditem.operator === 'GEOMINTER' ? 'true' : 'false'} `;
        // } else {
        // condstr += ` ${conditemFieldReset} ${this.RelationSign[conditem.operator.toUpperCase()]}  ${itemvalue} `;
        condstr += this.dealdifferentConds(conditem, conditemFieldReset, itemvalue);
        // }
        return condstr;
    };
    // 通用处理 不同类型数据库继承此类后，拓展此方法
    BasesqlConds.prototype.dealdifferentItemvalue = function (_a) {
        var conditem = _a.conditem, rntable = _a.rntable;
        var itemvalue = (conditem.value || conditem.value == '0') ? "'".concat(conditem.value, "'") : '';
        return itemvalue;
    };
    // 通用处理 不同类型数据库继承此类后，拓展此方法
    BasesqlConds.prototype.dealdifferentConds = function (conditem, conditemFieldReset, itemvalue) {
        return " ".concat(conditemFieldReset, " ").concat(this.RelationSign[conditem.operator.toUpperCase()], "  ").concat(itemvalue, " ");
    };
    /**
     * 通用统计-通用分组条件组织
     * @param condObj 分组字段条件 1.支持字段名,分隔 2.支持[{ "type":"CG", "field":"field1", "rename":"newfield1" }]
     * @returns
     */
    BasesqlConds.prototype.groupCondPackage = function (condObj) {
        var groupObj = {
            groupbycond: '',
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
            condArr.forEach(function (_cond) {
                var _a = groupConds(_cond), cond = _a.cond, field = _a.field;
                conds_1.push(cond);
                fields_1.push(field);
            });
            groupObj = {
                groupbycond: ' group by ' + conds_1.join(',') + ' ',
                fields: " " + fields_1.join(',') + " ",
            };
        }
        else { // 传参为,分隔的字段
            var condstr = condObj;
            groupObj.groupbycond = " group by \"".concat(condstr.split(',').join('","'), "\" ");
            groupObj.fields = " \"".concat(condstr.split(',').join('","'), "\" ");
        }
        return groupObj;
    };
    /**
     * 通用统计-统计条件聚合函数组织
     * @param conds 通用统计-统计条件聚合函数组织
     * @returns
     */
    BasesqlConds.prototype.statisCondPackage = function (conds) {
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
    BasesqlConds.prototype._statisCondPackage = function (conds, sqlconds) {
        var StaticsRelationSign = function (key, field, typecast) {
            var _ = {
                // 1.type 当type = 'ZDY' 自定义，可以将aggSign传以下可以进行optSign操作的聚合函数，可实现【sum(zd1) + sum(zd2)... || max(zd1) * max(zd2)... || avg(zd1) + avg(zd2)... ...】,即实现多个字段的统计基础上的加减乘除操作
                ZDZ: "max(\"".concat(field, "\"").concat(typecast, ")"), ZXZ: "min(\"".concat(field, "\"").concat(typecast, ")"), PJZ: "avg(\"".concat(field, "\"").concat(typecast, ")"), BZC: "stddev_pop(\"".concat(field, "\"").concat(typecast, ")"), FC: "var_pop(\"".concat(field, "\"").concat(typecast, ")"),
                QH: "sum(\"".concat(field, "\"").concat(typecast, ")"), STR: "string_agg(\"".concat(field, "\"::varchar, ',')"), ARR: "array_agg(\"".concat(field, "\"").concat(typecast, ")"),
                // optSign 运算操作符
                JIA: '+', JIAN: '-', CHENG: '*', CHU: '/',
            };
            return _[key];
        };
        var _loop_1 = function (item) {
            var aggObj = '';
            // 支持多个字段sum(zd1) + sum(zd2)... || max(zd1) * max(zd2)... || avg(zd1) + avg(zd2)... ...
            if (item.type === 'ZDY' && item.aggSign && item.optSign) {
                var fieldArr = item.field && item.field.split(',') || [];
                var fieldList_1 = [];
                fieldArr.forEach(function (field) {
                    if (item.typecast) {
                        fieldList_1.push("".concat(StaticsRelationSign(item.aggSign, field, '::' + item.typecast)));
                    }
                    else {
                        fieldList_1.push("".concat(StaticsRelationSign(item.aggSign, field, '')));
                    }
                });
                aggObj = fieldList_1.join(StaticsRelationSign(item.optSign));
            }
            else {
                if (item.typecast) {
                    aggObj = "".concat(StaticsRelationSign(item.type, item.field, '::' + item.typecast));
                }
                else {
                    aggObj = "".concat(StaticsRelationSign(item.type, item.field, ''));
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
    /**
     * 将数组对象转换为sql     测试一段时间在发布版本
     * @param tablename {*} 表名
     * @param DataList {*} 数据数组 []
     * @param param2 {*} config 转换配置
     * @param param2.idfield {*} 主键字段(暂不支持联合主键)
     * @param param2.pattern {*} 模式 insert/auto   insert 时，只生成insert语句，  auto时，会根据数据对象中是否存在idfield去生成 insert/update 语句
     * @param param2.timefields {*} 时间类型字段设置 将时间类型的字段用,分隔
     * @param param2.geomfields {*} 空间类型字段设置（postgres时支持）
     * @param param2.geomsrid   {*} 空间字段坐标系类型 （postgres时支持） 默认4490
     * @returns
     */
    BasesqlConds.prototype.objtosql = function (tablename, DataList, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.idfield, idfield = _c === void 0 ? 'id' : _c, _d = _b.pattern, pattern = _d === void 0 ? 'insert' : _d, _e = _b.timefields, timefields = _e === void 0 ? '' : _e, _f = _b.geomfields, geomfields = _f === void 0 ? '' : _f, _g = _b.geomsrid, geomsrid = _g === void 0 ? '4490' : _g;
        var result = { code: 1, sql: '' };
        var dealSql = ' ';
        // const uuid = require('uuid');
        var timefieldsArr = timefields.split(',');
        var geomfieldsArr = geomfields.split(',');
        DataList = typeof DataList === 'string' ? JSON.parse(DataList) : DataList;
        for (var _i = 0, DataList_1 = DataList; _i < DataList_1.length; _i++) {
            var dataItem = DataList_1[_i];
            if (pattern == 'auto' && Object.prototype.hasOwnProperty.call(dataItem, idfield) && dataItem[idfield] && dataItem[idfield] !== '') {
                // 编辑
                var setSqlArr = [];
                for (var key in dataItem) {
                    if (timefieldsArr.includes(key) && dataItem[key] === -1) {
                        setSqlArr.push("".concat(key, " = now() "));
                    }
                    else if (this._flag === 'postgres' && key && geomfieldsArr.includes(key)) {
                        var _data = JSON.stringify(dataItem[key]);
                        setSqlArr.push("\"".concat(key, "\"=public.ST_SetSRID(public.st_geomfromgeojson('").concat(_data.replace(/\s+/g, ''), "'),").concat(geomsrid, ")"));
                    }
                    else if (dataItem[key] || dataItem[key] === '' || dataItem[key] === 0) {
                        if (typeof dataItem[key] === 'object') {
                            setSqlArr.push("\"".concat(key, "\"='").concat(JSON.stringify(dataItem[key]), "'"));
                        }
                        else {
                            setSqlArr.push("\"".concat(key, "\"='").concat(dataItem[key], "'"));
                        }
                    }
                    else {
                        setSqlArr.push("\"".concat(key, "\"=null"));
                    }
                }
                dealSql += " update  \"".concat(tablename, "\"  set  ").concat(setSqlArr.join(','), " where \"").concat(idfield, "\"='").concat(dataItem[idfield], "' RETURNING *; ");
            }
            else {
                if (idfield) {
                    // dataItem[idfield] =uuid.v4();
                }
                // 新增
                var insertFieldArr = [];
                var insertValueArr = [];
                for (var key in dataItem) {
                    insertFieldArr.push("\"".concat(key, "\""));
                    if (timefieldsArr.includes(key)) {
                        insertValueArr.push('now()');
                    }
                    else if (this._flag === 'postgres' && key && geomfieldsArr.includes(key)) {
                        var _data = typeof dataItem[key] == "string" ? dataItem[key] : JSON.stringify(dataItem[key]);
                        insertValueArr.push("public.ST_SetSRID(public.st_geomfromgeojson('".concat(_data.replace(/\s+/g, ''), "'),4490)"));
                    }
                    else {
                        if (dataItem[key] || dataItem[key] === '' || dataItem[key] === 0) {
                            if (typeof dataItem[key] === 'object') {
                                insertValueArr.push("'".concat(JSON.stringify(dataItem[key]), "'"));
                            }
                            else {
                                insertValueArr.push("'".concat(dataItem[key], "'"));
                            }
                        }
                        else {
                            insertValueArr.push('null');
                        }
                    }
                }
                dealSql += "insert into \"".concat(tablename, "\" (").concat(insertFieldArr.join(','), ") values (").concat(insertValueArr.join(','), ") RETURNING *;");
            }
        }
        result.sql = dealSql;
        return result;
    };
    return BasesqlConds;
}());
exports.default = BasesqlConds;
