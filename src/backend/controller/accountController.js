const validator = require('validator');
const { USER, HTTP_CODES } = require('../constants.js');
const { secure } = require('../helper.js');

class AccountController {

    constructor(authService, mysqlService, cacheService) {
        this.authService = authService;
        this.mysqlService = mysqlService;
        this.cacheService = cacheService;
    }

    /*  username
    *   password
    */  
    login = (req, res) => {

         
        let data = {
            username : secure(req.body.username) ,
            password: secure(req.body.password),
            token : secure(req.body.token)
        }

        if (req.body.token) {
            const userDetails = this.authService.get_user(data.token);
            if (userDetails)
                res.send({ result: "already_logged_in", code: HTTP_CODES.SUCCESS });
            return;
        }

        if (data.username.length < USER.USERNAME_MIN_LIMIT ||
            data.username.length > USER.USERNAME_MAX_LIMIT ) {
            res.send({ result: "invalid_username", code: HTTP_CODES.DATA_ERROR });
            return;
        }

        if (data.password.length < USER.PASSWORD_MIN_LIMIT ||
            data.password.length > USER.PASSWORD_MAX_LIMIT ) {
            res.send({ result: "invalid_password", code: HTTP_CODES.DATA_ERROR });
            return;
        }

        const userDetails = this.authService.check_credentials(req.body.username, req.body.password);
        if (!userDetails) {
            res.send({ result: "wrong_credentials", code: HTTP_CODES.UNAUTHORIZED });
            return;
        }

        let authHash = this.authService.start_auth_hash(userDetails["id"]);
        this.cacheService.set(USER.CACHE_PREFIX + authHash, userDetails);

        res.send({ result: "logged_in", authHash: authHash, code: HTTP_CODES.SUCCESS });
    }

    /*  token
    */
    logout = (req, res) => {
        let data = {
            token : secure(req.body.token)
        }

        if(data.token.length != USER.AUTH_HASH_LENGTH)
        {
            res.send({ result: "not_logged_in", code: HTTP_CODES.UNAUTHORIZED });
            return;
        }

        let userDetails = this.cacheService.get(USER.CACHE_PREFIX + data.token);
        if (!userDetails)
            userDetails = this.authService.get_user(data.token);

        if (!userDetails) {
            res.send({ result: "not_logged_in", code: HTTP_CODES.UNAUTHORIZED  });
            return;
        }

        const userID = userDetails["id"];
        const authHash = userDetails["auth_hash"];

        this.cacheService.drop(USER.CACHE_PREFIX + authHash);
        this.authService.drop_auth_hash(userID);
        res.send({ result: "OK", code: 200 });
    }

    /*
    *   username
    *   password
    *   re_password
    *   mail
    *   full_name
    *   birth_date
    *   locale
    *   country_code
    *   phone
    *   sex
    */
    create_account = (req, res) => {
        
        let data = {
            username : secure(req.body.username) ,
            password: secure(req.body.password),
            re_password : secure(req.body.re_password),
            mail : secure(req.body.mail),
            full_name : secure(req.body.full_name),
            birth_date : secure(req.body.birth_date),
            locale : secure(req.body.locale),
            country_code : secure(req.body.country_code) ,
            phone : secure(req.body.phone),
            sex : parseInt(secure(req.body.sex))
        }

        /* Data error handlers */
        if (data.username.length < USER.USERNAME_MIN_LIMIT ||
            data.username.length > USER.USERNAME_MAX_LIMIT ) {
            res.send({ result: "invalid_username", code: HTTP_CODES.DATA_ERROR });
            return;
        }

        if (data.password.length < USER.PASSWORD_MIN_LIMIT ||
            data.password.length > USER.PASSWORD_MAX_LIMIT ) {
            res.send({ result: "invalid_password", code: HTTP_CODES.DATA_ERROR });
            return;
        }

        if (data.password != data.re_password) {
            res.send({ result: "passwords_didnt_matching", code: HTTP_CODES.DATA_ERROR });
            return;
        }

        if(!validator.isEmail(data.mail))
        {
            res.send({ result: "mail_isnt_valid", code: HTTP_CODES.DATA_ERROR });
            return;
        }

        if (data.full_name.length < USER.USERNAME_MIN_LIMIT ||
            data.full_name.length > USER.USERNAME_MAX_LIMIT ||
            !req.body.full_name.includes(" ")
            ) {
            res.send({ result: "full_name_not_valid", code: HTTP_CODES.DATA_ERROR });
            return;
        }

        if(!validator.isDate(data.birth_date))
        {
            res.send({ result: "birth_date_not_valid", code: HTTP_CODES.DATA_ERROR });
            return; 
        }
    
        if(!validator.isLocale(data.locale))
        {
            res.send({ result: "locale_not_valid", code: HTTP_CODES.DATA_ERROR });
            return; 
        }

        if(!validator.isISO31661Alpha3(data.country_code))  //checks country code
        {
            res.send({ result: "country_code_not_valid", code: HTTP_CODES.DATA_ERROR });
            return; 
        }
        
        if(!validator.isMobilePhone(data.phone, 'any'))
        {
            res.send({ result: "phone_number_not_valid", code: HTTP_CODES.DATA_ERROR });
            return;  
        }

        if(!Object.values(USER.SEX).includes(data.sex))
        {
            res.send({ result: "unknown_sex", code: HTTP_CODES.DATA_ERROR });
            return;
        }

        if(!this.__is_account_available(data.username, data.mail, data.phone))
        {
            res.send({ result: "already_exist", code: HTTP_CODES.DATA_ERROR });
            return;
        }

        /* Account create process */
        let updateResult = this.authService.create_account(data);
        if (updateResult) {
            this.authService.create_verification(data);
            res.send({ result: "account_created", code: HTTP_CODES.SUCCESS });
            return;
        }

        res.send({ result: "internal_error", code: HTTP_CODES.INTERNAL });
        return;

    }

    create_account_submit_secure_code = (req, res) => {
        res.send({ result: "OK", code: 200 });
    }
    
    //TODO
    change_pass = (req, res) => {

        if (!req.body.old_password || 
            !req.body.new_password ||
            !req.body.new_password_again){
                res.send({ result: "invalid_credentials", code: 300 });
                return;
            }
        
        if (req.body.old_password.length < PASSWORD_LENGTH_LIMIT ||
            req.body.new_password.length < PASSWORD_LENGTH_LIMIT ||
            req.body.new_password_again.length < PASSWORD_LENGTH_LIMIT) {
            res.send({ result: "short_credentials", code: 300 });
            return;
        }

        if (req.body.new_password != req.body.new_password_again)
        {
            res.send({ result: "not_matching_passwords", code: 300 });
            return;
        }

        if (!req.body.token) {
            res.send({ result: "not_logged_in", code: 100 });
            return;
        }
        
        let userDetails = this.authService.getUser(req.body.token);
        if (!userDetails)
        {
            res.send({ result: "not_logged_in", code: 100 });
            return;      
        }

        let updateResult = this.authService.updatePassword(userDetails["id"], req.body.old_password, req.body.new_password_again)
        if(!updateResult)
        {
            res.send({ result: "password_missmatch", code: 100 });
            return;
        }
        
        this.cacheService.del(USER_PREFIX + req.body.token );
        res.send({ result: "ok", code: 200 });
        return;

    }

    /* TODO  */
    resetpass_send_mail = (req, res) => {
        res.send({ result: "OK", code: 200 });
    }

    resetpass_submit_secure_code = (req, res) => {
        res.send({ result: "OK", code: 200 });
    }

    create_account_send_mail = (req, res) => {
        res.send({ result: "OK", code: 200 });
    }


    __is_account_available = (username, mail, phone)=>{
        
        let query = `SELECT id FROM user WHERE username = ? OR mail = ? OR phone = ?`;
        let values = [username, mail, phone];
        let mysqlResult = this.mysqlService.execute(query, values); 
        return mysqlResult.length > 0 ? false : true;
    }
    
    __get_users_world_record = (user_id) => {
        let query = `SELECT world_hash,town_collection_id FROM world_records WHERE user_id = ?`;
        let values = [user_id];
        let mysqlResult = this.mysqlService.execute(query, values); 
        return mysqlResult.length > 0 ? mysqlResult : [];
    };

    //TODO
    __create_worl_record = () => {

    };

};

module.exports = AccountController