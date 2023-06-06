const CONFIG = require('./config.js');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');

class ExpressWrapper{

    static create = () =>{
        const app = express();
        app.use(fileUpload({ createParentPath: true }));
        app.use(cors());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        
        
        return app;
    }

    static start = (app) =>{
        app.listen(CONFIG.PORT, () => {
            console.log(`Saag Authentication service started at endpoint :\nhttp://127.0.0.1:${CONFIG.PORT}`);
          })
    }
}


module.exports = ExpressWrapper