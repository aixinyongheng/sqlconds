# Sqlconds
sql 通用查询条件组织  
前后台约定通用查询条件
# Install 安装
npm install sqlconds
# Usage 使用
```javascript
 const Sqlconds = require('sqlconds');

 const sqlconds =new Sqlconds("postgres"); // postgres/mysql/oracle ...
 const sqlres= sqlconds.condPackage( [{"operator":"EQ","field":"bm","value":"zrzhczt_ggfwss_xx"},{"operator":"OBD","field":"px"}] );

 sqlres.conds; // and   (  "bm"   =   'zrzhczt_ggfwss_xx' )
 sqlres.order; // order by   "px" desc  

```
# Grammer 参数语法
## condPackage 查询过滤条件组织/排序条件
| params |require |paramname | bz      |
|:--------:|--|:--------: |-------------:|
|conds|yes|组织sql筛选条件||
|conds.field|yes|字段名||
|conds.operator|yes|操作类型|EQ: ' = ', EQN: '!=', EQ_D: ' = ', GT: ' > ', LT: '<', GTE: ' >= ', LTE: ' <= ', FQ: ' like ', FQL: ' like ', FQR: ' like ', INULL: ' is null ', INNULL: ' is not null ', IN: ' in ', INN: 'not in ',JSONIN: ' ? ', GEOMINTER: '=', GEOMNOTINTER: '=' OBA: ' order by ', OBD: ' order by  ', OB: ' order by  '
|conds.value|no|条件值||
|conds.whereLinker|no|条件连接符|默认 and|
|conds.condition|no|条件|传参内容为conds|
|conds.whereLinkerCondition|no|内部条件连接符|当condition存在时，连接其条件的连接符，默认and|
|rntable|no|表名||
 

# example 示例
支持pg的空间相交

|require|conds|res|
|---|:--------:|-------------:|
|查询表中field1为11，并且field2同时为1和2的条件| [{"operator":"EQ","field":"field1","value":"11","condition":[{"operator":"EQ","field":"field2","value":"1"},{"whereLinker":"or","operator":"EQ","field":"field2","value":"2"}]}] |and "field1" ='11' and ( "field2"='1' or field2='2' )|
|pg中查询与114,32点位相交的数据|[{"operator":"GEOMINTER","field":"geom","value":{"type":"Point","coordinates":[118.530982355499,28.6730332199371]}}]| and   ( st_intersects( "geom" , st_setsrid(st_geomfromgeojson('{"type":"Point","coordinates":[118.530982355499,28.6730332199371]}'),4490)) =  true )|

# todo 支持简单通用统计分析条件
