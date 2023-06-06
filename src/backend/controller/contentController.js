const {  HTTP_CODES, USER } = require('../constants.js');
const { secure, get_unix_timestamp, stampToDateTime,
    base64_to_string, get_time_difference, str_to_bool
} = require('../helper.js');

class ContentController {

    constructor(authService, mysqlService) {
        this.authService = authService;
        this.mysqlService = mysqlService;
    }

    /*
    *   username
    */
    get_profile = (req, res) => {
        let data = {
            username: secure(req.body.username)
        }

        if(!data.username)
        {
            res.send({ result: "missing_parameter", code: HTTP_CODES.DATA_ERROR });
            return;
        }
        let profile_details = this._fetch_user_profile(data.username);
        if (!profile_details) {
            res.send({ result: "user_not_found", code: HTTP_CODES.NOTFOUND });
            return;
        }
        const user_id = profile_details.id;
        const user_settings = this._get_user_setting(user_id);
        
        let show_age = USER.SETTINGS.DEFAULT_SHOW_AGE;
        let show_gender = USER.SETTINGS.DEFAULT_SHOW_GENDER;
        let show_web_profile = USER.SETTINGS.DEFAULT_SHOW_WEB_PROFILE;

        if(user_settings != null)
        {
            show_age = user_settings.hasOwnProperty("show_age") ? str_to_bool(user_settings.show_age) : true;
            show_gender = user_settings.hasOwnProperty("show_gender") ? str_to_bool(user_settings.show_gender) : true;
            show_web_profile = user_settings.hasOwnProperty("show_web_profile") ? str_to_bool(user_settings.show_web_profile) : true;
        }
        
        if(!show_web_profile)
        {
            res.send({ 
                response: { 
                    profile: {
                        user_id: user_id
                    } 
                
                },
                result: "not_allowed", 
                code: HTTP_CODES.NOT_ALLOWED });
            return;
        }
        

        let profile = {}
        profile.user_id = user_id;
        profile.content_list = this._fetch_content_list(user_id);
        profile.series_list = JSON.parse(base64_to_string(profile_details.serie_list));
        profile.serie_reviews = this._get_user_serie_reviews(user_id);
        profile.films_list = JSON.parse(base64_to_string(profile_details.film_list));
        profile.film_reviews = this._get_user_film_reviews(user_id);
        profile.account_create_date = stampToDateTime(profile_details.created_at);
        profile.film_list_update_time = get_time_difference(profile_details.film_list_update_time, get_unix_timestamp());
        profile.serie_list_update_time = get_time_difference(profile_details.serie_list_update_time, get_unix_timestamp());
        profile.last_seen_time = get_time_difference(this.authService.get_last_seen_time(user_id), get_unix_timestamp());
        profile.bio = secure(base64_to_string(profile_details.bio));
        profile.username = profile_details.username;

        if (show_age)
            profile.age = this.__calculate_age(profile_details.birth_date);

        if (show_gender)
            profile.sex = profile_details.sex;

        res.send({ result: "ok", response: { profile: profile }, code: HTTP_CODES.SUCCESS });
    }


    _get_user_setting = (user_id) => {

        let query = `SELECT 
            user_id, settings
            FROM user_settings WHERE user_id = ?`;
        let values = [user_id];
        let mysql_result = this.mysqlService.execute(query, values);
        return mysql_result.length > 0 ? JSON.parse(base64_to_string(mysql_result[0].settings)) : null;
    }

    _fetch_content_list = (owner_id) => {
        let query = `SELECT * FROM content WHERE owner_id = ? ORDER BY content_index asc`;
        let values = [owner_id];
        let mysqlResult = this.mysqlService.execute(query, values);
        return mysqlResult.length > 0 ? mysqlResult : [];
    }

    _fetch_user_profile = (username) => {
        let query = `SELECT 
            id, username, full_name, profile_picture, bio, created_at, 
            country_code, sex, state, film_list	, film_list_update_time,
            serie_list, serie_list_update_time, birth_date 
        FROM user WHERE username = ?`;
        let values = username;
        let mysql_result = this.mysqlService.execute(query, values);
        return mysql_result.length > 0 ? this.__null_safety(mysql_result[0]) : null;
    }

    _get_user_film_reviews = (user_id) => {
        let query = `SELECT film_imdb_id, point, review, created_at
        FROM film_reviews 
        WHERE user_id = ?`;
        let values = [user_id];
        let mysqlResult = this.mysqlService.execute(query, values); 
        return mysqlResult.length > 0 ? mysqlResult : [];
    }

    _get_user_serie_reviews = (user_id) => {
        let query = `SELECT serie_imdb_id, point, review, created_at
        FROM serie_reviews 
        WHERE user_id = ?`;
        let values = [user_id];
        let mysqlResult = this.mysqlService.execute(query, values); 
        return mysqlResult.length > 0 ? mysqlResult : [];
    }
    

    __null_safety = (item) =>{
        if(item == null)
            return null;
        for (const key in item) {
            if(item[key] == null)
                continue;
            if (item[key].length == 0)
                item[key] = null;
        }
        return item;
    }

    __calculate_age = (birth_date) => {
        let age_difference = Date.now() - birth_date;
        let age_date = new Date(age_difference);
        return Math.abs(age_date.getUTCFullYear() - 1970);
    }
}

module.exports = ContentController;