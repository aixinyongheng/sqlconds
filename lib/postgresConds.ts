// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-var-requires
// const sqlstring = require("./utils/sqlstring");
import BasesqlConds from './basesqlConds'
/**
 * todo 1.防止sql注入
 *      2.eslint配置
 *      3.通用统计sql组织
 */
class Postgresconds extends BasesqlConds {
  // private _flag;
  // private _mode;
  private relationsign_pg = { JSONIN: ' ? ', GEOMINTER: '=', GEOMNOTINTER: '=' }
  /**
   * 构造函数
   * @param flag 数据库类型  [postgres/mysql/oracle/...]
   */
  constructor(flag = 'postgres', { mode = 'default' } = { mode: 'default' }) {
    // this._flag = flag;
    // this._mode = mode;
    super(flag, { mode })
    this.RelationSign = { ...this.RelationSign, ... this.relationsign_pg }
  }

  // postgres条件值特殊处理
  dealdifferentItemvalue({ conditem, rntable }: any) {
    let itemvalue = '';
    if (conditem.operator.toUpperCase() === 'GEOMINTER' || conditem.operator.toUpperCase() === 'GEOMNOTINTER') {
      itemvalue = '';
    } else {
      itemvalue = (conditem.value || conditem.value == '0') ? `'${conditem.value}'` : ''
    }
    return itemvalue
  }

  //  postgres特有条件拼接特殊处理
  dealdifferentConds(conditem: any, conditemFieldReset: any, itemvalue: any) {
    let condstr = '';
    if (conditem.operator.toUpperCase() === 'GEOMINTER' || conditem.operator.toUpperCase() === 'GEOMNOTINTER') {
      console.log(` ${JSON.stringify(this.RelationSign)} 
      ${conditem.operator}
       ${this.RelationSign[conditem.operator]}`);
      condstr = ` st_intersects(${conditemFieldReset}, st_setsrid(st_geomfromgeojson('${typeof conditem.value === 'object' ? JSON.stringify(conditem.value) : conditem.value}'),4490)) ${this.RelationSign[conditem.operator]}  ${conditem.operator === 'GEOMINTER' ? 'true' : 'false'} `;
    } else {
      condstr = ` ${conditemFieldReset} ${this.RelationSign[conditem.operator.toUpperCase()]}  ${itemvalue} `
    }
    return condstr;
  }

}
export default Postgresconds;