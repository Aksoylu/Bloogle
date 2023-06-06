const mysql = require('mysql');
const deasync = require('deasync');



class MySqlService {
    constructor(config) {
        this.config = config;
        this.transcation = mysql.createConnection({
            host: this.config.IP,
            user: this.config.USER,
            password: this.config.PASSWORD,
            database: this.config.DATABASE
        });

        this.transcation.connect((err)  =>{
            if (err) { console.log(err); return null; }
        });

    }

    execute = (query, values) =>{

        let mysqlResult = null;
        this.transcation.query(query, values, (err, results) => {
            if (err) { console.log(err); return null; }
            
            mysqlResult = results;
        });

        while(mysqlResult == null) deasync.runLoopOnce();
        return mysqlResult;
    }

}

module.exports = MySqlService