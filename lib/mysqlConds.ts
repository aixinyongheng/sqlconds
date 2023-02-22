// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-var-requires
// const sqlstring = require("./utils/sqlstring");
import BasesqlConds from './basesqlConds'
/**
 * todo 1.防止sql注入s
 *      2.eslint配置
 *      3.通用统计sql组织
 */
class MysqlConds extends BasesqlConds {
  // private _flag;
  // private _mode;
  /**
   * 构造函数
   * @param flag 数据库类型  [postgres/mysql/oracle/...]
   */
  constructor(flag = 'mysql', { mode = 'default' } = { mode: 'default' }) {
    // this._flag = flag;
    // this._mode = mode;
    super(flag, { mode })
  }

  dealdifferentItemvalue({ conditem, rntable }: any) {
    const itemvalue = (conditem.value || conditem.value == '0') ? `'${conditem.value}'` : ''
    return itemvalue
  }
  dealdifferentConds(conditem: any, conditemFieldReset: any, itemvalue: any) {
    let condstr = '';
    // todo 
    condstr = ` ${conditemFieldReset} ${this.RelationSign[conditem.operator.toUpperCase()]}  ${itemvalue} `
    return condstr;
  }

}
export default MysqlConds;