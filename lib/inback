// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-var-requires
// const sqlstring = require("./utils/sqlstring");
/**
 * todo 1.防止sql注入
 *      2.eslint配置
 *      3.通用统计sql组织
 */
class Sqlconds {
  private _flag;
  private _mode;
  /**
   * 构造函数
   * @param flag 数据库类型  [postgres/mysql/oracle/...]
   */
  constructor(flag = 'postgres', { mode = 'default' } = { mode: 'default' }) {
    this._flag = flag;
    this._mode = mode;
  }
  /**
   * 
   * @param conds 查询条件
   * @param rntable 表名
   * @returns 
   */
  public condPackage(conds: unknown, rntable: string) {
    if (!conds || conds === '') {
      return { cond: '', order: '' };
    }
    let rntalbeflag = '';
    if (rntable) {
      if (rntable.indexOf('"') >= 0) {
        rntalbeflag = `${rntable}.`;
      } else {
        rntalbeflag = `"${rntable}".`;
      }
    }
    conds = typeof conds === 'string' ? JSON.parse(conds) : conds;
    const result = { cond: '', order: '' };
    const sqlRes = this._condstostr({ conds, rntable: rntalbeflag });
    result.cond = 'and ' + sqlRes.condsstr;
    if (sqlRes.orderstr) {
      result.order = 'order by ' + sqlRes.orderstr;
    } else {
      result.order = '';
    }
    return result;
  }

  private _condstostr({ conds, rntable }: any) {
    const result: any = {};
    let condsstr = '';
    let orderstr = '';
    if (conds.length === 0) {
      return { condsstr: ' ( 1=1 ) ', orderstr };
    }
    condsstr += '  (';
    for (let index = 0; index < conds.length; index++) { // for  in  有问题
      const item = conds[index];
      if (+index !== 0) { // 非首个条件，增加连接符 and/or
        condsstr += ` ${item.whereLinker ? item.whereLinker : 'and'} `;
      }
      // 排序的后面提出来，目前兼容下之前的传参
      if (item.operator.toUpperCase() === 'OBA' || item.operator.toUpperCase() === 'OBD' || item.operator.toUpperCase() === 'OB') {
        condsstr += ' 1 = 1 ';
        if (orderstr) { // 排序已有值，增加连接符 ,
          orderstr += ' , ';
        }
        if (item.operator.toUpperCase() === 'OBD') { // 如果最后一个是排序，则闭环
          orderstr += `  ${rntable}"${item.field}" desc  `;
        } else if (item.operator.toUpperCase() === 'OB') { // 如果最后一个是排序，则闭环
          orderstr += `    field(${rntable}"${item.field}",${item.value})   `;
        } else if (item.operator.toUpperCase() === 'OBA') { // 如果最后一个是排序，则闭环
          orderstr += `   ${rntable}"${item.field}"  asc  `;
        }
      } else {
        condsstr += this._formatCondsql({ conditem: item, rntable });
      }
      if (item.condition && item.condition.length > 0) {
        const condRes = this._condstostr({ conds: item.condition, rntable });
        condsstr += ` ${item.whereLinkerCondition ? item.whereLinkerCondition : 'and'}  ${condRes.condsstr} `;
        if (orderstr) {
          orderstr += `,${condRes.orderstr}`;
        } else {
          orderstr += condRes.orderstr;
        }

      }
    }
    condsstr += ')';
    result.condsstr = condsstr;
    result.orderstr = orderstr;
    return result;
  }

  // 条件转换
  private _formatCondsql({ conditem, rntable }: any) {
    const RelationSign: any = {
      EQ: ' = ', EQN: ' != ', EQ_D: ' = ', GT: ' > ', LT: ' < ', GTE: ' >= ', LTE: ' <= ', FQ: ' like ', NFQ: ' not like ', FQL: ' like ', FQR: ' like ', INULL: ' is null ', INNULL: ' is not null ', IN: ' in ', INN: ' not in ', BTN: ' between ', OBA: ' order by ', OBD: ' order by  ', OB: ' order by  ', JSONIN: ' ? ', GEOMINTER: '=', GEOMNOTINTER: '=',
    };

    let condstr: any = '';
    let conditemFieldReset: any = ` ${rntable}"${conditem.field}" `;

    if (conditem.fun) {
      conditemFieldReset = ` ${conditem.fun}(${rntable}"${conditem.field}") `;
    }
    // 内容值处理
    let itemvalue = '';
    if (conditem.operator.toUpperCase() === 'FQ' || conditem.operator.toUpperCase() === 'NFQ') {
      itemvalue = conditem.value ? ` '%${conditem.value}%' ` : '%%';
    } else if (conditem.operator.toUpperCase() === 'FQL') {
      itemvalue = conditem.value ? ` '%${conditem.value}' ` : '%';
    } else if (conditem.operator.toUpperCase() === 'FQR') {
      itemvalue = conditem.value ? ` '${conditem.value}%' ` : '%';
    } else if (conditem.operator.toUpperCase() === 'IN') {
      itemvalue = `('${conditem.value.split(',').join('\',\'')}')`;
    } else if (conditem.operator.toUpperCase() === 'INN') {
      itemvalue = `('${conditem.value.split(',').join('\',\'')}')`;
    } else if (conditem.operator.toUpperCase() === 'BTN') {
      itemvalue = `'${conditem.value.split(',').join('\' and  \'')}'`;
    } else if (conditem.operator.toUpperCase() === 'GEOMINTER' || conditem.operator.toUpperCase() === 'GEOMNOTINTER') {
      itemvalue = '';
    } else {
      itemvalue = (conditem.value || conditem.value == '0') ? `'${conditem.value}'` : '';
    }
    //  条件处理
    if (conditem.operator.toUpperCase() === 'GEOMINTER' || conditem.operator.toUpperCase() === 'GEOMNOTINTER') {
      condstr += ` st_intersects(${conditemFieldReset}, st_setsrid(st_geomfromgeojson('${typeof conditem.value === 'object' ? JSON.stringify(conditem.value) : conditem.value}'),4490)) ${RelationSign[conditem.operator]}  ${conditem.operator === 'GEOMINTER' ? 'true' : 'false'} `;
    } else {

      condstr += ` ${conditemFieldReset} ${RelationSign[conditem.operator.toUpperCase()]}  ${itemvalue} `;
    }
    return condstr;
  }


  /**
   * 通用统计-通用分组条件组织
   * @param condObj 分组字段条件 1.支持字段名,分隔 2.支持[{ "type":"CG", "field":"field1", "rename":"newfield1" }]
   * @returns 
   */
  public groupCondPackage(condObj: string | Array<object>) {
    let groupObj = {
      groupbycond: '',
      fields: '1',
    };
    if (!condObj || condObj === '') {
      return groupObj;
    }
    const groupConds = ({ type, field, rename, }: any) => {
      field = field && field.replace(/\\/g, '\\').replace(/'/g, '\'\'').replace(/-/g, '');
      rename = rename && rename.replace(/\\/g, '\\').replace(/'/g, '\'\'').replace(/-/g, '');
      const types: any = {
        CG: `"${field}"`, SUB: `substring(${field})`,
      };
      return {
        cond: types[type],
        field: `${types[type]} ${rename ? `AS "${rename}"` : ''}`,
      };
    };
    if ((typeof condObj == 'string' && condObj.trim().indexOf("[") == 0) || typeof condObj == 'object') { // 传参为array或者array的字符串格式
      const condArr: any = typeof condObj === 'string' ? JSON.parse(condObj) : condObj;
      const conds: any = [],
        fields: any = [];
      condArr.forEach((_cond: any) => {
        const { cond, field } = groupConds(_cond);
        conds.push(cond);
        fields.push(field);
      });
      groupObj = {
        groupbycond: ' group by ' + conds.join(',') + ' ',
        fields: " " + fields.join(',') + " ",
      };
    } else { // 传参为,分隔的字段
      const condstr: string = condObj;
      groupObj.groupbycond = ` group by "${condstr.split(',').join('","')}" `;
      groupObj.fields = ` "${condstr.split(',').join('","')}" `;
    }
    return groupObj;
  }

  /**
   * 通用统计-统计条件聚合函数组织
   * @param conds 通用统计-统计条件聚合函数组织
   * @returns 
   */
  public statisCondPackage(conds: string | Array<object>) {
    // 过滤 '[]'空数组
    if (!conds || conds === '' || conds === '[]') {
      return { statiscond: '' };
    }
    conds = typeof conds === 'string' ? JSON.parse(conds) : conds;

    const result = { statiscond: '' };
    const sqlconds = [[], []];
    this._statisCondPackage(conds, sqlconds);
    result.statiscond = ` ${sqlconds[0].join(',')} `;
    return result;
  }

  private _statisCondPackage(conds: any, sqlconds: any) {
    const RelationSign: any = (key: string, field: string, typecast: string) => {
      const _: any = {
        // 1.type 当type = 'ZDY' 自定义，可以将aggSign传以下可以进行optSign操作的聚合函数，可实现【sum(zd1) + sum(zd2)... || max(zd1) * max(zd2)... || avg(zd1) + avg(zd2)... ...】,即实现多个字段的统计基础上的加减乘除操作
        ZDZ: `max("${field}"${typecast})`, ZXZ: `min("${field}"${typecast})`, PJZ: `avg("${field}"${typecast})`, BZC: `stddev_pop("${field}"${typecast})`, FC: `var_pop("${field}"${typecast})`,
        QH: `sum("${field}"${typecast})`, STR: `string_agg("${field}"::varchar, ',')`, ARR: `array_agg("${field}"${typecast})`,
        // optSign 运算操作符
        JIA: '+', JIAN: '-', CHENG: '*', CHU: '/',
      };
      return _[key];
    };
    for (const item of conds) {
      let aggObj = '';
      // 支持多个字段sum(zd1) + sum(zd2)... || max(zd1) * max(zd2)... || avg(zd1) + avg(zd2)... ...
      if (item.type === 'ZDY' && item.aggSign && item.optSign) {
        const fieldArr = item.field && item.field.split(',') || [];
        const fieldList: string[] = [];
        fieldArr.forEach((field: any) => {
          if (item.typecast) {
            fieldList.push(`${RelationSign(item.aggSign, field, '::' + item.typecast)}`);
          } else {
            fieldList.push(`${RelationSign(item.aggSign, field, '')}`);
          }
        });
        aggObj = fieldList.join(RelationSign(item.optSign));
      } else {
        if (item.typecast) {
          aggObj = `${RelationSign(item.type, item.field, '::' + item.typecast)}`;
        } else {
          aggObj = `${RelationSign(item.type, item.field, '')}`;
        }
      }
      if (item.dpoint) {
        sqlconds[0].push(`round(${aggObj},${item.dpoint}) AS "${item.rename}" `);
      } else {
        sqlconds[0].push(`${aggObj} AS "${item.rename}"`);
      }
    }
  }

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
  public objtosql(tablename: string, DataList: any, { idfield = 'id', pattern = 'insert', timefields = '', geomfields = '', geomsrid = '4490' } = {}) {
    const result = { code: 1, sql: '' };
    let dealSql = ' ';
    // const uuid = require('uuid');
    const timefieldsArr = timefields.split(',');
    const geomfieldsArr = geomfields.split(',');
    DataList = typeof DataList === 'string' ? JSON.parse(DataList) : DataList;
    for (const dataItem of DataList) {
      if (pattern == 'auto' && Object.prototype.hasOwnProperty.call(dataItem, idfield) && dataItem[idfield] && dataItem[idfield] !== '') {
        // 编辑
        const setSqlArr = [];
        for (const key in dataItem) {
          if (timefieldsArr.includes(key) && dataItem[key] === -1) {
            setSqlArr.push(`${key} = now() `);
          } else if (this._flag === 'postgres' && key && geomfieldsArr.includes(key)) {
            const _data = JSON.stringify(dataItem[key]);
            setSqlArr.push(`"${key}"=public.ST_SetSRID(public.st_geomfromgeojson('${_data.replace(/\s+/g, '')}'),${geomsrid})`);
          } else if (dataItem[key] || dataItem[key] === '' || dataItem[key] === 0) {
            if (typeof dataItem[key] === 'object') {
              setSqlArr.push(`"${key}"='${JSON.stringify(dataItem[key])}'`);
            } else {
              setSqlArr.push(`"${key}"='${dataItem[key]}'`);
            }
          } else {
            setSqlArr.push(`"${key}"=null`);
          }
        }
        dealSql += ` update  "${tablename}"  set  ${setSqlArr.join(',')} where "${idfield}"='${dataItem[idfield]}' RETURNING *; `;
      } else {
        if (idfield) {
          // dataItem[idfield] =uuid.v4();
        }
        // 新增
        const insertFieldArr = [];
        const insertValueArr = [];
        for (const key in dataItem) {
          insertFieldArr.push(`"${key}"`);
          if (timefieldsArr.includes(key)) {
            insertValueArr.push('now()');
          } else if (this._flag === 'postgres' && key && geomfieldsArr.includes(key)) {
            const _data = typeof dataItem[key] == "string" ? dataItem[key] : JSON.stringify(dataItem[key]);
            insertValueArr.push(`public.ST_SetSRID(public.st_geomfromgeojson('${_data.replace(/\s+/g, '')}'),4490)`);
          } else {
            if (dataItem[key] || dataItem[key] === '' || dataItem[key] === 0) {
              if (typeof dataItem[key] === 'object') {
                insertValueArr.push(`'${JSON.stringify(dataItem[key])}'`);
              } else {
                insertValueArr.push(`'${dataItem[key]}'`);
              }
            } else {
              insertValueArr.push('null');
            }
          }
        }
        dealSql += `insert into "${tablename}" (${insertFieldArr.join(',')}) values (${insertValueArr.join(',')}) RETURNING *;`;
      }
    }
    result.sql = dealSql;
    return result;
  }



}
module.exports = Sqlconds;