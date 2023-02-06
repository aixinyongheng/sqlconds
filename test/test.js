/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
'use strict';
const expect = require('chai').expect;
const Sqlconds = require('../dist/index');
// import sqlconds from "../dist/index"

describe('class Sqlconds:', () => {
  it('condPackage:', () => {
    const sqlconds = new Sqlconds("postgres");
    const res = sqlconds.condPackage([{ "operator": "eq", "field": "bm", "value": "zrzhczt_ggfwss_xx" }, { "operator": "obd", "field": "px" }]);
    // console.log(sqlconds.condPackage([{"operator":"GEOMINTER","field":"geom","value":{"type":"Point","coordinates":[118.530982355499,28.6730332199371]}}]))
    expect(res.cond).to.equal(`and   (  "bm"   =   'zrzhczt_ggfwss_xx'  and  1 = 1 )`);
    expect(res.order).to.equal(`order by   "px" desc  `);
  });

  it('groupCondPackage:', () => {
    const sqlconds = new Sqlconds("postgres");
    const res = sqlconds.groupCondPackage('field1,field2');
    expect(res.groupbycond).to.equal(` group by "field1","field2" `);
    expect(res.fields).to.equal(` "field1","field2" `);
    const res2 = sqlconds.groupCondPackage('[{ "type":"CG", "field":"field1", "rename":"newfield1" },{ "type":"SUB", "field":"field2,1,4", "rename":"newfield2" }]');
    expect(res2.groupbycond).to.equal(` group by "field1",substring(field2,1,4) `);
    expect(res2.fields).to.equal(` "field1" AS "newfield1",substring(field2,1,4) AS "newfield2" `);
  });

  it('statisCondPackage:', () => {
    const sqlconds = new Sqlconds("postgres");
    const res = sqlconds.statisCondPackage([{ "field": "field1", "type": "ZDZ", "rename": "最大值", "dpoint": 0 }]);
    expect(res.statiscond).to.equal(` max("field1") AS "最大值" `);

  });

  it('objtosql:', () => {
    const sqlconds = new Sqlconds("postgres");
    const res = sqlconds.objtosql("tableA", [{
      "id": "111", "name": "test", "geom": {
        "coordinates": [112.3257164817677,
          35.342031483036436
        ],
        "type": "Point"
      }
    }], { geomfields: 'geom', geomsrid: 4490 });
    expect(res.sql).to.equal(` insert into "tableA" ("id","name","geom") values ('111','test',public.ST_SetSRID(public.st_geomfromgeojson('{"coordinates":[112.3257164817677,35.342031483036436],"type":"Point"}'),4490)) RETURNING *;`);
  });

});