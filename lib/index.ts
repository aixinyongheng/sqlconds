
import PostgresConds from './postgresConds';
import MysqlConds from './mysqlConds';
import Basesqlconds from './basesqlConds';
const Sqlconds = (function () {
    let instance: Basesqlconds;

    return function (name: string, config?: object) {

        if (name == "postgres") {
            instance = new PostgresConds(name, config);

        } else if (name == "mysql") {
            instance = new MysqlConds(name, config);

        } else if (name == "oracle") {
            instance = new PostgresConds(name, config);

        } else {
            instance = new PostgresConds(name, config);
        }
        return instance;
    }
})();



module.exports = Sqlconds;