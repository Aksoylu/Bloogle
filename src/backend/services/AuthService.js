const deasync = require('deasync');
const {md5, generateRandomString, get_unix_timestamp} = require ('../helper.js');
const { USER } = require('../constants.js');
const nodemailer = require('nodemailer');
var MAIL_TRANSPORTER = nodemailer.createTransport({
    port: 587,
    secure: false
});



const VERIFICATION_PROCESS = {
    NEW_ACCOUNT : 0,
    RENEW_PASS : 1
}

class AuthService {
    constructor(mysqlService, cacheService) {
        this.mysqlService = mysqlService
        this.cacheService = cacheService
    }

    get_last_seen_time = (user_id) => {
        let last_seen_cache = this.cacheService.get(USER.LAST_SEEN_PREFIX + user_id);
        return last_seen_cache ? last_seen_cache : this._sql_get_last_seen(user_id);
    }

    set_last_seen_time = (user_id) => {
        this.cacheService.set(USER.LAST_SEEN_PREFIX + user_id, get_unix_timestamp());
    }

    get_user_session = (token) =>{
        if (!token) 
            return null;
     

        let userDetailsCache = this.cacheService.get(USER.CACHE_PREFIX + token);
        const userDetails = userDetailsCache ? userDetailsCache : this.get_user(token);
        
        if (!userDetails)
            return null;

        this.cacheService.set(USER.CACHE_PREFIX + token, userDetails);
        return userDetails;
    }

    get_user = (token, criteria = "*") => {
        let userInfo = this.cacheService.get(USER.CACHE_PREFIX+ token);
        if (userInfo != null)
            return userInfo;

        let query = `SELECT ${criteria} FROM user WHERE auth_hash = ?`;
        let values = [token];
        let mysqlResult = this.mysqlService.execute(query, values); 
        let sqlResult = mysqlResult.length > 0 ? mysqlResult[0] : null;

        if(sqlResult)
        {
            this.cacheService.set(USER.CACHE_PREFIX + token, sqlResult);
            return sqlResult;
        }
        else
            return null;
       
    }

    check_credentials = (username, password) => {
        
        let query = `SELECT * FROM user WHERE username = ? AND password = ?`;
        let values = [username, md5(password)];
        let mysqlResult = this.mysqlService.execute(query, values); 
        return mysqlResult.length > 0 ? mysqlResult[0] : null;
       
    }

    start_auth_hash = (userID) => {
        /* TODO */
        let query = `UPDATE user SET auth_hash = ? WHERE id = ?`;
        let hash = md5(generateRandomString(32) + userID);
        let values = [hash, userID];
        let mysqlResult = this.mysqlService.execute(query, values);
        if(!mysqlResult)
            return null;
        return hash;
    }

    drop_auth_hash = (userID) =>{
        let query = `UPDATE user SET auth_hash = ? WHERE id = ?`;
        let values = ["", userID];
        this.mysqlService.execute(query, values);

    }
    
    // TODO
    create_account_by_google = (data) => {
        
    }
    
    /*
        {
            username : secure(req.body.username) ? req.body.username : "",
            password: secure(req.body.password) ? req.body.password : "",
            re_password : secure(req.body.re_password) ? req.body.re_password : "",
            mail : secure(req.body.mail) ? req.body.mail : "",
            full_name : secure(req.body.full_name) ? req.body.full_name : "",
            birth_date : secure(req.body.birth_date) ? req.body.birth_date : "",
            locale : secure(req.body.locale) ? req.body.locale : "",
            country_code : secure(req.body.country_code) ? req.body.country_code : "",
            phone : secure(req.body.phone) ? req.body.phone : "",
            sex : secure(req.body.sex) ? req.body.sex : "",
        }
    */
    create_account = (data) =>{
        try{
            let created_at = get_unix_timestamp();
            let is_verified  = false;
            let query = `INSERT INTO user (
                username, password, mail, full_name, birth_date, 
                locale, country_code, phone, sex, state, created_at, is_verified) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            let values = [data.username, md5(data.password), data.mail, 
                data.full_name, data.birth_date, data.locale, 
                data.country_code, data.phone, data.sex,
                USER.STATE.UNVERIFIED, created_at, is_verified
            ];
    
            this.mysqlService.execute(query, values);
            return true
        }
        catch(exception){
            return false;
        }
        
    }
    /* 
    *   {
    *       user_id
    *   }
    *
    */
    create_verification = (user_name) => {

        let {user_id, user_mail} = this._get_user_config_by_username(user_name);
        let verification_code = null; //helper.
        let expire_time = get_unix_timestamp() + (3 * 24 * 60 * 60);
        //VERIFICATION_PROCESS.
        let query = `INSERT INTO user_verification
            (user_id, code, process, expire_time) 
            VALUES (?, ?, ?, ?)
        `;
        let values = [user_id, verification_code, VERIFICATION_PROCESS.NEW_ACCOUNT, expire_time];
        this.mysqlService.execute(query, values);
        this._send_verification_mail(VERIFICATION_PROCESS.NEW_ACCOUNT, user_mail, user_name, expire_time);
    }

    // TODO
    _get_user_config_by_username  = (user_name) => {
        
        let query = `SELECT last_login FROM user WHERE id = ?`;
        let values = [user_id];
        let mysqlResult = this.mysqlService.execute(query, values); 
        let sqlResult = mysqlResult.length > 0 ? mysqlResult[0]["last_login"] : null;

        if(!sqlResult)
            return null;

        this.cacheService.set(USER.LAST_SEEN_PREFIX + user_id, sqlResult);
        return sqlResult;
    }

    // TODO
    _send_verification_mail = (verification_type, user_mail, user_name, expire_time) => {
        const mail_options = {
            from: 'youremail@gmail.com',
            to: user_mail,
            subject: 'Sending Email using Node.js',
            html: '<h1>Welcome</h1><p>That was easy!</p>'
        }

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        });
    }

    _sql_get_last_seen = (user_id) => {
        
        let query = `SELECT last_login FROM user WHERE id = ?`;
        let values = [user_id];
        let mysqlResult = this.mysqlService.execute(query, values); 
        let sqlResult = mysqlResult.length > 0 ? mysqlResult[0]["last_login"] : null;

        if(!sqlResult)
            return null;

        this.cacheService.set(USER.LAST_SEEN_PREFIX + user_id, sqlResult);
        return sqlResult;
    }
}

module.exports = AuthService