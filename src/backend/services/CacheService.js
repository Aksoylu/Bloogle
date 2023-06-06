const fs = require('fs');

class CacheService{
    constructor(config){
        this.config = config;
        this.cache_buffer = {};
    }

    set = (key, value) =>{
        this.cache_buffer[key] = value;
    }

    get = (key) =>{
        return (key in this.cache_buffer) ? this.cache_buffer[key] : null; 
    }

    del = (key) =>{
        delete this.cache_buffer[key];
    }

    drop = (key) =>{
        delete this.cache_buffer[key];
    }

    flush = () =>{
        this.cache_buffer = {};
    }

    save = () =>{
        fs.writeFileSync(this.config.path, JSON.stringify(this.cache_buffer));
    }

    load = () =>{
        if (!fs.existsSync(this.config.path))
            return false;

        try{
            this.cache_buffer = JSON.parse(fs.readFileSync('file', 'utf8'));
            return true;
        }
        catch{
            return false;
        }
    }

    

}

module.exports = CacheService