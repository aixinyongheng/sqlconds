'use strict';
const expect = require('chai').expect;
const Sqlconds = require('../dist/index');
// import sqlconds from "../dist/index"

describe('class Sqlconds:', () => {
  it('condPackage:', () => {
    const sqlconds =new Sqlconds("postgres");
    const res= sqlconds.condPackage( [{"operator":"EQ","field":"bm","value":"zrzhczt_ggfwss_xx"},{"operator":"OBD","field":"px"}] );
    // expect(sqlConds.flag).to.equal(` and bm ='zrzhczt_ggfwss_xx' `);
    expect(res.cond).to.equal(`and   (  "bm"   =   'zrzhczt_ggfwss_xx'  and  1 = 1 )`);
    expect(res.order).to.equal(`order by   "px" desc  `);
  });
});