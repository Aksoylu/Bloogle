const fs = require('fs');
const request = require('request');

const { STORAGE, COVER} = require('../constants.js');
const { md5, generateRandomString, get_unix_timestamp } = require('../helper.js');


class StorageService {
    constructor(config) {
        this.config = config;
    }

    create_photo_signature = (user_id, username) => {
        return md5(user_id + "_" + username + "_" + generateRandomString(32) + "_" + get_unix_timestamp());
    }

    get_profile_photo = (file_name = null) => {
        if (!file_name)
            return this.config.PATH + '/users/' + '__notfound.png'
        else
            return this.__validate(this.config.PATH + '/users/' + file_name + '.png');
    }

    set_profile_photo = (file_name, file) => {
        const upload_path = STORAGE.PROFILE_PHOTO_PATH + file_name + ".png";
        file.mv(upload_path, (err) => {
            if (err)
                return false;
            return true;
        });

    }

    is_profile_photo_exist = (file_name) => {
        if(!filename)
            return false;
        return fs.existsSync(STORAGE.PROFILE_PHOTO_PATH + file_name + ".png");
    }

    delete_profile_photo = (file_name) => {
        if (!this.is_profile_photo_exist(file_name))
            return;

        fs.unlinkSync(STORAGE.PROFILE_PHOTO_PATH + file_name + ".png");
    }

    get_content_photo = (file_name = null) => {
        if (!file_name)
            return this.config.PATH + '/content/' + '__notfound.png';
        else
            return this.__validate(this.config.PATH + '/content/' + file_name + '.png');
    }

    set_content_photo = (file_name, file) => {
        const upload_path = STORAGE.CONTENT_PHOTO_PATH + file_name + ".png";
        file.mv(upload_path, (err) => {
            if (err)
                return false;
            return true;
        });

    }

    is_content_photo_exist = (file_name) => {
        if(!filename)
            return false;
        return fs.existsSync(STORAGE.CONTENT_PHOTO_PATH + file_name + ".png");
    }

    delete_content_photo = (file_name) => {
        if (!this.is_content_photo_exist(file_name))
            return;

        fs.unlinkSync(STORAGE.CONTENT_PHOTO_PATH + file_name + ".png");
    }


    get_cover_photo = (file_name = null) => {
        if (!file_name)
            return null;
        else
            return this.__validate(STORAGE.COVER_PHOTO_PATH + file_name + '.png');
    }

    set_cover_photo = (file_name, cover_url, callback = ()=> {}) => {
        const upload_path = STORAGE.COVER_PHOTO_PATH + file_name + ".png";
        this.__download_cover_image_external(
            cover_url, 
            upload_path,
            callback
        );
    }

    is_cover_photo_exist = (file_name) => {
        console.log("looking for : " + (STORAGE.COVER_PHOTO_PATH + file_name + ".png"));
        if(!file_name)
            return false;
        return fs.existsSync(STORAGE.COVER_PHOTO_PATH + file_name + ".png");
    }

    get_cover_photo_default = () =>{
        return STORAGE.COVER_PHOTO_PATH + STORAGE.COVER_PHOTO_DEFAULT + '.png'
    }



    __validate = (path) => {
        if (fs.existsSync(path))
            return path;
        else
            return null;
    }

    __download_cover_image_external = (url, save_path, callback) => {
        try{
            if (url == null || save_path == null)
            return;
            request.head(url, (err, res, body) => {
                request(url).pipe(fs.createWriteStream(save_path)).on('close', callback);
            });
        }
        catch(exception)
        {
            console.log("error on '__download_cover_image_external':" +exception.toString());
        }
        
    };

}

module.exports = StorageService