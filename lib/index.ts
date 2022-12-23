class  Sqlconds {
  private flag;
  constructor(flag:Text){
    this.flag=flag;
  }
  /**
   * 
   * @param conds 查询条件
   * @param rntable 表名
   * @returns 
   */
  condPackage(conds:any, rntable:any) {
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
    console.log(result);
    return result;
  }

  _condstostr({ conds, rntable }:any) {
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
  _formatCondsql({ conditem, rntable }:any) {
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
}
module.exports=Sqlconds;