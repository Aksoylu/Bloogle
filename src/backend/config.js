
CONFIG = {

    PORT : 4140,

    MYSQL : {
        IP: "127.0.0.1",
        PORT : 3704,
        USER: "root",
        PASSWORD: "",
        DATABASE: "saag_authentication"
    },


    CACHE : {
        PATH : "C:/Users/mumit/OneDrive/Masaüstü/aorias/__cache__"
    },

    STORAGE : {
        PATH : "C:/Users/mumit/OneDrive/Masaüstü/aorias/__storage__"
    },
    

    CONTAINERS : {
        ALPHA : {
            HASH : "a118u",
            NAME : "Gattaca",
            ENDPOINT : "http://127.0.0.1:1440"
        }
    }
    

}

module.exports= CONFIG;