const HTTP_CODES = {
    UNAUTHORIZED : 401,
    NOTFOUND : 404,
    SUCCESS : 200,
    DATA_ERROR : 300,
    INTERNAL : 500,
    NOT_ALLOWED : 808
};

const USER = {
    USERNAME_MIN_LIMIT : 4,
    USERNAME_MAX_LIMIT : 32,
    PASSWORD_MIN_LIMIT : 4,
    PASSWORD_MAX_LIMIT : 16,
    AUTH_HASH_LENGTH : 32,
    CACHE_PREFIX : "_USER_",
    LAST_SEEN_PREFIX : "_LAST_SEEN_",
    SEX : {
        UNSPECIFIED : 0,
        MAN : 1,
        WOMAN : 2
    },

    STATE : {
        WAITING_PASSWORD_RESET_CODE : -1,
        UNVERIFIED : 0,
        VERIFIED : 1,
        ADMIN : 2

    },

    PREMIUM : {
        NONE : 0,
        GOLD : 2,
        PREMIUM :3,
    },

    BLUE_TICK : {
        NO : 0,
        YES : 1
    },

    //Default settings mockup
    SETTINGS : {
        DEFAULT_MATCH_DISTANCE : 35,
        MAX_MATCH_DISTANCE : 100,
        MIN_MATCH_DISTANCE : 10,

        DEFAULT_SHOW_AGE : true,
        DEFAULT_SHOW_GENDER : true,
        DEFAULT_SHOW_DISTANCE : true,
        DEFAULT_SHOW_WEB_PROFILE : true,
        DEFAULT_LOOKING_FOR : 0, // 0 : Relationship/Opposite Gender | 1 : Friendship/OnlyWoman | 2:Friendship/OnlyMan | 3:Frienship/All
        DEFAULT_INTERESTED_SEX : 0,
        KEYS : ["show_age", "show_gender", "show_distance", "show_web_profile", "match_distance", "looking_for", "interested_sex"]
    },

    

};

const STORAGE = {
    PROFILE_PHOTO_PATH : "C:/Users/mumit/OneDrive/Masaüstü/aorias/__storage__/users/",
    CONTENT_PHOTO_PATH : "C:/Users/mumit/OneDrive/Masaüstü/aorias/__storage__/content/",
    COVER_PHOTO_PATH : "C:/Users/mumit/OneDrive/Masaüstü/aorias/__storage__/cover/",
    COVER_PHOTO_DEFAULT : "default"
};


module.exports = {HTTP_CODES,  USER, STORAGE}