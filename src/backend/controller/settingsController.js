const { secure, string_to_base64, base64_to_string, get_unix_timestamp } = require('../helper.js');
const {HTTP_CODES, USER} = require('../constants');

class SettingsController {

    constructor(authService, mysqlService, storageService) {
        this.authService = authService;
        this.mysqlService = mysqlService;
        this.storageService = storageService;
    }

    /*  token
    *   image
    */
    set_profile_photo = (req, res) => {
        const data = {
            token : secure(req.body.token) ,
            image : req.files["profile_photo"]
        };
        const user_details = this.authService.get_user_session(data.token);
        if (!user_details) {
            res.send({ result: "not_authorized", code: HTTP_CODES.UNAUTHORIZED });
            return;
        }

        const user_id = user_details["id"];
        const username = user_details["username"];
        const image_signature = this.storageService.create_photo_signature(user_id, username);
        this.storageService.set_profile_photo(image_signature, data.image);
        this.__update_profile_photo_signature(user_id, image_signature)
        res.send({ result: "profile_photo_set_ok", code: HTTP_CODES.SUCCESS });
        this.authService.set_last_seen_time(user_id);
    }

    /*  token
    *   content
    */
    set_biography = (req, res) => {
        const data = {
            token : secure(req.body.token) ,
            content : secure(req.body.content) ,
        };

        const user_details = this.authService.get_user_session(data.token);
        if (!user_details) {
            res.send({ result: "not_authorized", code: HTTP_CODES.UNAUTHORIZED });
            return;
        }
        const user_id = user_details["id"];
        this.__update_bio(user_id, string_to_base64(data.content));
        res.send({ result: "bio_update_ok", code: HTTP_CODES.SUCCESS });
        this.authService.set_last_seen_time(user_id);


    }
    
    /*
    *   token
    */
    get_user_settings = (req,res ) => {
        const data = {
            token : secure(req.body.token)
        };

        const user_details = this.authService.get_user_session(data.token);
        if (!user_details) {
            res.send({ result: "not_authorized", code: HTTP_CODES.UNAUTHORIZED });
            return;
        }
        const user_id = user_details["id"];
        let user_settings = this.__fetch_user_settings(user_id);
        if (!user_settings)
            user_settings = this.__get_default_user_settings();
        
        res.send({ result: "ok", user_settings : user_settings, code: HTTP_CODES.SUCCESS  });
        this.authService.set_last_seen_time(user_id);
    }

    /*
    *   token
    *   key
    *   value
    */
    set_user_settings = (req,res ) => {
        const data = {
            token : secure(req.body.token),
            key : secure(req.body.key),
            value : secure(req.body.value)
        };

        const user_details = this.authService.get_user_session(data.token);
        if (!user_details) {
            res.send({ result: "not_authorized", code: HTTP_CODES.UNAUTHORIZED });
            return;
        }

        if(!USER.SETTINGS.KEYS.includes(data.key))
        {
            res.send({ result: "unknown_settings_key", code: HTTP_CODES.NOTFOUND });
            return;
        }

        const user_id = user_details["id"];
        let settings = this.__fetch_user_settings(user_id);
        if (!settings)
        {
            settings = this.__get_default_user_settings();
            settings[data.key] = data.value;
            this.__create_user_settings(user_id,settings);
            res.send({ result: "ok", settings : settings, code: HTTP_CODES.SUCCESS  });
            return;
        }   
        
        settings = settings["settings"];
        settings[data.key] = data.value;
        this.__update_user_settings(user_id, settings);
        res.send({ result: "ok", settings : settings, code: HTTP_CODES.SUCCESS  });
        this.authService.set_last_seen_time(user_id);
    }
    
    __update_profile_photo_signature = (user_id, image_signature)=>{
        
        let query = `UPDATE user set profile_picture = ? WHERE id = ?`;
        let values = [image_signature, user_id];
        let mysqlResult = this.mysqlService.execute(query, values); 
        return mysqlResult.length > 0 ? false : true;
    }

    __update_content_photo_signature = (user_id, image_signature)=>{
        
        let query = `SELECT id FROM user WHERE username = ? OR mail = ? OR phone = ?`;
        let values = [username, mail, phone];
        let mysqlResult = this.mysqlService.execute(query, values); 
        return mysqlResult.length > 0 ? false : true;
    }

    __update_bio = (user_id, content) => {
        let query = `UPDATE user SET  
            bio = ?
            WHERE id = ?
        `;
        let values = [content, user_id];
        this.mysqlService.execute(query, values);
    }


    __get_default_user_settings = ()=>{
        return {
            match_distance : USER.SETTINGS.DEFAULT_MATCH_DISTANCE,
            show_age : USER.SETTINGS.DEFAULT_SHOW_AGE,
            show_gender : USER.SETTINGS.DEFAULT_SHOW_GENDER,
            show_distance: USER.SETTINGS.DEFAULT_SHOW_DISTANCE,
            show_web_profile : USER.SETTINGS.DEFAULT_SHOW_WEB_PROFILE,
            looking_for : USER.SETTINGS.DEFAULT_LOOKING_FOR,
            interested_sex : USER.SETTINGS.DEFAULT_INTERESTED_SEX
        };
    }

    __create_user_settings= (user_id, data) => {
        let settings = string_to_base64(JSON.stringify(data));
        let last_update_time = get_unix_timestamp();
        let query = `INSERT INTO user_settings (
            user_id, settings, update_time) 
            VALUES (?, ?, ?)
        `;
        let values = [user_id, settings, last_update_time];
        this.mysqlService.execute(query, values);
    }

    __update_user_settings = (user_id, data) => {
        let settings = string_to_base64(JSON.stringify(data));
        let query = `UPDATE user_settings SET settings = ? WHERE user_id = ?`;
        let values = [settings, user_id];
        this.mysqlService.execute(query, values);
    }

    __fetch_user_settings = (user_id) => {
        let query = `SELECT user_id, settings, update_time FROM user_settings WHERE user_id = ?`;
        let values = [user_id];
        let mysql_result = this.mysqlService.execute(query, values); 
        let settings = mysql_result.length > 0 ? mysql_result[0]: null;
        if(!settings)
            return null;
        
        settings["settings"] = JSON.parse(base64_to_string(settings["settings"]));
        return settings;
    }


    
};

module.exports = SettingsController