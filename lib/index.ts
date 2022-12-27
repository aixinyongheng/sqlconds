/**
 * todo 1.防止sql注入
 *      2.eslint配置
 *      3.通用统计sql组织
 */
class  Sqlconds {
  private flag;
  /**
   * 构造函数
   * @param flag 数据库类型  [postgres/mysql/oracle/...]
   */
  constructor(flag:Text){
    this.flag=flag;
  }
  /**
   * 
   * @param conds 查询条件
   * @param rntable 表名
   * @returns 
   */
  public condPackage(conds:any, rntable:any) {
    if (!conds || conds === '') {
      return { cond: '', order: '' };
    }
    let rntalbeflag:any = '';
    if (rntable) {
      if (rntable.indexOf('"') >= 0) {
        rntalbeflag = `${rntable}.`;
      } else {
        rntalbeflag = `"${rntable}".`;
      }
    }
    conds = typeof conds === 'string' ? JSON.parse(conds) : conds;
    const result:any = { cond: '', order: '' };
    const sqlRes:any = this._condstostr({ conds, rntable: rntalbeflag });
    result.cond = 'and ' + sqlRes.condsstr;
    if (sqlRes.orderstr) {
      result.order = 'order by ' + sqlRes.orderstr;
    } else {
      result.order = '';
    }
    return result;
  }

  private _condstostr({ conds, rntable }:any) {
    const result:any = {};
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
      if (item.operator === 'OBA' || item.operator === 'OBD' || item.operator === 'OB') {
        condsstr += ' 1 = 1 ';
        if (orderstr) { // 排序已有值，增加连接符 ,
          orderstr += ' , ';
        }
        if (item.operator === 'OBD') { // 如果最后一个是排序，则闭环
          orderstr += `  ${rntable}"${item.field}" desc  `;
        } else if (item.operator === 'OB') { // 如果最后一个是排序，则闭环
          orderstr += `    field(${rntable}"${item.field}",${item.value})   `;
        } else if (item.operator === 'OBA') { // 如果最后一个是排序，则闭环
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
  private  _formatCondsql({ conditem, rntable }:any) {
    const RelationSign:any = {
      EQ: ' = ', EQN: ' != ', EQ_D: ' = ', GT: ' > ', LT: ' < ', GTE: ' >= ', LTE: ' <= ', FQ: ' like ', NFQ: ' not like ', FQL: ' like ', FQR: ' like ', INULL: ' is null ', INNULL: ' is not null ', IN: ' in ', INN: ' not in ', BTN: ' between ', OBA: ' order by ', OBD: ' order by  ', OB: ' order by  ', JSONIN: ' ? ', GEOMINTER: '=', GEOMNOTINTER: '=',
    };

    let condstr:any = '';
    let conditemFieldReset:any = ` ${rntable}"${conditem.field}" `;

    if (conditem.fun) {
      conditemFieldReset = ` ${conditem.fun}(${rntable}"${conditem.field}") `;
    }
    // 内容值处理
    let itemvalue = '';
    if (conditem.operator === 'FQ' || conditem.operator === 'NFQ') {
      itemvalue = conditem.value ? ` '%${conditem.value}%' ` : '%%';
    } else if (conditem.operator === 'FQL') {
      itemvalue = conditem.value ? ` '%${conditem.value}' ` : '%';
    } else if (conditem.operator === 'FQR') {
      itemvalue = conditem.value ? ` '${conditem.value}%' ` : '%';
    } else if (conditem.operator === 'IN') {
      itemvalue = `('${conditem.value.split(',').join('\',\'')}')`;
    } else if (conditem.operator === 'INN') {
      itemvalue = `('${conditem.value.split(',').join('\',\'')}')`;
    } else if (conditem.operator === 'BTN') {
      itemvalue = `'${conditem.value.split(',').join('\' and  \'')}'`;
    } else if (conditem.operator === 'GEOMINTER' || conditem.operator === 'GEOMNOTINTER') {
      itemvalue = '';
    } else {
      itemvalue = (conditem.value || conditem.value == '0') ? `'${conditem.value}'` : '';
    }
    //  条件处理
    if (conditem.operator === 'GEOMINTER' || conditem.operator === 'GEOMNOTINTER') {
      condstr += ` st_intersects(${conditemFieldReset}, st_setsrid(st_geomfromgeojson('${typeof conditem.value === 'object' ? JSON.stringify(conditem.value) : conditem.value}'),4490)) ${RelationSign[conditem.operator]}  ${conditem.operator === 'GEOMINTER' ? 'true' : 'false'} `;
    } else {

      condstr += ` ${conditemFieldReset} ${RelationSign[conditem.operator]}  ${itemvalue} `;
    }
    return condstr;
  }


  /**
   * 通用统计-通用分组条件组织
   * @param condObj 分组字段条件 1.支持字段名,分隔 2.支持[{ "type":"CG", "field":"field1", "rename":"newfield1" }]
   * @returns 
   */
  public groupCondPackage(condObj:String|Array<Object>) {
    let groupObj = {
      groupbyconds: '',
      fields: '1',
    };
    if (!condObj || condObj === '') {
      return groupObj;
    }
    const groupConds = ({ type, field, rename, }:any) => {
      field = field && field.replace(/\\/g, '\\').replace(/'/g, '\'\'').replace(/-/g, '');
      rename = rename && rename.replace(/\\/g, '\\').replace(/'/g, '\'\'').replace(/-/g, '');
      const types:any = {
        CG: `"${field}"`, SUB: `substring(${field})`,
      };
      return {
        cond: types[type],
        field: `${types[type]} ${rename ? `AS "${rename}"` : ''}`,
      };
    };
    if((typeof condObj=='string'&&condObj.trim().indexOf("[")==0)||typeof condObj=='object'){ // 传参为array或者array的字符串格式
        let condArr:Array<any> = typeof condObj === 'string' ? JSON.parse(condObj) : condObj;
        const conds:Array<any> = [],
        fields:Array<Object> = [];
        console.log(condArr);
        condArr.forEach((_cond) => {
          const { cond, field } = groupConds(_cond);
          conds.push(cond);
          fields.push(field);
        });
        groupObj = {
          groupbyconds: ' group by ' + conds.join(',')+' ',
          fields: " "+fields.join(',')+" ",
        };
    } else { // 传参为,分隔的字段
      let condstr:String =condObj;
      groupObj.groupbyconds = ` group by "${condstr.split(',').join('","')}" `;
      groupObj.fields = ` "${condstr.split(',').join('","')}" `;
    }
    return groupObj;
  }

  /**
   * 通用统计-统计条件聚合函数组织
   * @param conds 通用统计-统计条件聚合函数组织
   * @returns 
   */
  public statisCondPackage(conds:String|Array<Object>) {
    // 过滤 '[]'空数组
    if (!conds || conds === ''|| conds === '[]') {
      return { statiscond: '' };
    }
    conds = typeof conds === 'string' ? JSON.parse(conds) : conds;
    
    const result = { statiscond: '' };
    const sqlconds = [[], []];
    this._statisCondPackage(conds, sqlconds);
    result.statiscond = ` ${sqlconds[0].join(',')} `;
    return result;
  }

  private _statisCondPackage(conds:any, sqlconds:any) {
    const RelationSign:any = (key: string , field: string, typecast: string ) => {
      const _:any = {
        // 1.type 当type = 'ZDY' 自定义，可以将aggSign传以下可以进行optSign操作的聚合函数，可实现【sum(zd1) + sum(zd2)... || max(zd1) * max(zd2)... || avg(zd1) + avg(zd2)... ...】,即实现多个字段的统计基础上的加减乘除操作
        ZDZ: `max("${field}"${typecast})`, ZXZ: `min("${field}"${typecast})`, PJZ: `avg("${field}"${typecast})`, BZC: `stddev_pop("${field}"${typecast})`, FC: `var_pop("${field}"${typecast})`,
        QH: `sum("${field}"${typecast})`, STR: `string_agg("${field}"::varchar, ',')`, ARR: `array_agg("${field}"${typecast})`,
        // optSign 运算操作符
        JIA: '+', JIAN: '-', CHENG: '*', CHU: '/',
      };
      return _[key];
    };
    let index = 0;
    for (const item of conds) {
      index++;
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
  
}
module.exports=Sqlconds;