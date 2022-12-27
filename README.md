# Sqlconds
sql 通用查询条件组织  
sql 通用统计条件组织  
前后台约定通用查询条件
 
github仓库地址: [ https://github.com/aixinyongheng/sqlconds]( https://github.com/aixinyongheng/sqlconds)

# Install 安装
npm install sqlconds
# Usage 使用
```javascript
 const Sqlconds = require('sqlconds');
 
 const sqlconds =new Sqlconds("postgres"); // postgres/mysql/oracle ...
 // 1.筛选条件组织
 const sqlres= sqlconds.condPackage( [{"operator":"EQ","field":"bm","value":"zrzhczt_ggfwss_xx"},{"operator":"OBD","field":"px"}] );

 sqlres.conds; // and   (  "bm"   =   'zrzhczt_ggfwss_xx' )
 sqlres.order; // order by   "px" desc

 `select * from tableA where 1=1 ${sqlres.conds} ${sqlres.order}`

 // 2. 分组条件组织
 // 2.1 分组group by 字段
 const groupbyRes=sqlconds.groupCondPackage('[{ "type":"CG", "field":"field1", "rename":"newfield1" },{ "type":"SUB", "field":"field2,1,4", "rename":"newfield2" }]');

 groupbyRes.groupbyconds; //  group by "field1",substring(field2,1,4) 
 groupbyRes.fields; //  "field1" AS "newfield1",substring(field2,1,4) AS "newfield2" 

 `select count(*),${groupbyRes.fields} from tableA where 1=1 ${sqlres.conds} ${groupbyRes.groupbyconds}`


 // 2.2 聚合统计函数组织
const statiscondRes = sqlconds.statisCondPackage([{"field":"field1","type":"ZDZ","rename":"最大值","dpoint":0}]);
statiscondRes.statiscond; //  max("field1") AS "最大值" 


 `select count(*),${groupbyRes.fields},${statiscondRes.statiscond} from tableA where 1=1 ${sqlres.conds} ${groupbyRes.groupbyconds}`

```
# Grammer 参数语法
## condPackage 查询过滤条件组织/排序条件
| params |require |paramname | description      |
|:--------:|--|:--------: |-------------:|
|conds|yes|组织sql筛选条件||
|conds.field|yes|字段名||
|conds.operator|yes|操作类型|EQ: ' = ', EQN: '!=', EQ_D: ' = ', GT: ' > ', LT: '<', GTE: ' >= ', LTE: ' <= ', FQ: ' like ' (field like '%$value%'), FQL: ' like '(field like '%$value'), FQR: ' like '(field like '$value%'), INULL: ' is null ', INNULL: ' is not null ', IN: ' in ', INN: 'not in ',JSONIN: ' ? ', GEOMINTER: '=', GEOMNOTINTER: '=' OBA: ' order by ', OBD: ' order by  ', OB: ' order by  '
|conds.value|no|条件值||
|conds.whereLinker|no|条件连接符|默认 and|
|conds.condition|no|条件|传参内容为conds|
|conds.whereLinkerCondition|no|内部条件连接符|当condition存在时，连接其条件的连接符，默认and|
|rntable|no|表名||
 
## groupCondPackage 分组查询条件组织
| params |require |paramname | description |
|:--------:|--|:--------: |-------------:|
|conds|yes|组织group by 字段条件|1.支持支持字段名,分隔  2.支持数组对象，具体参数如下|
|conds.type|yes|操作类型|CG:常规 field正常为字段名  SUB: substring 函数，field中为substring的函数内部的内容|
|conds.field|yes|字段名|当type为CG时，传入字段名；当type为SUB时，为substring函数内部内容|
|conds.rename|yes|重命名字段名|返回分组查询字段时重命名|


## statisCondPackage 聚合统计条件组织
| params |require |paramname | description |
|:--------:|--|:--------: |-------------:|
|conds|yes|组织聚合统计条件||
|conds.type|yes|聚合统计类型|ZDZ: '最大值', ZXZ: '最小值', PJZ: '平均值', BZC: '标准差', FC:'方差',QH:'求和（sum）',STR:(string_agg ,分隔 ),ARR:(array_agg),JIA,JIAN,CHENG,CHU|
|conds.field|yes|字段名||
|conds.rename|yes|重命名字段名|返回分组查询字段时重命名|
|conds.dppoint|no|保留精度（小数点后几位）|返回统计字段时保留精度|

# example 示例
1.支持高级查询条件
2.支持pg的空间相交函数
3.支持拓展高级查询条件（todo）

复杂查询示例：
|require|conds|result|
|---|:--------:|-------------:|
|查询表中field1为11，并且field2同时为1和2的条件| [{"operator":"EQ","field":"field1","value":"11","condition":[{"operator":"EQ","field":"field2","value":"1"},{"whereLinker":"or","operator":"EQ","field":"field2","value":"2"}]}] |and "field1" ='11' and ( "field2"='1' or field2='2' )|
|pg中查询与114,32点位相交的数据|[{"operator":"GEOMINTER","field":"geom","value":{"type":"Point","coordinates":[118.530982355499,28.6730332199371]}}]| and   ( st_intersects( "geom" , st_setsrid(st_geomfromgeojson('{"type":"Point","coordinates":[118.530982355499,28.6730332199371]}'),4490)) =  true )|


