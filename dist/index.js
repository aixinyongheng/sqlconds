"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var postgresConds_1 = __importDefault(require("./postgresConds"));
var mysqlConds_1 = __importDefault(require("./mysqlConds"));
var Sqlconds = (function () {
    var instance;
    return function (name, config) {
        if (name == "postgres") {
            instance = new postgresConds_1.default(name, config);
        }
        else if (name == "mysql") {
            instance = new mysqlConds_1.default(name, config);
        }
        else if (name == "oracle") {
            instance = new postgresConds_1.default(name, config);
        }
        else {
            instance = new postgresConds_1.default(name, config);
        }
        return instance;
    };
})();
module.exports = Sqlconds;
