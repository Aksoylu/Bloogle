const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');

class Router{

    static bind = (app, controllers) =>{

        app.get('/', cors(), (req, res) => { res.send('Scorp Backend Service Running as expected  !') });

        /* Get posts */

        /* Account & Authentication Management Rules */
        app.post('/auth/login', cors(), controllers.accountController.login);
        app.post('/auth/logout', cors(), controllers.accountController.logout);
        app.post('/auth/create_account', cors(), controllers.accountController.create_account); //TODO , ADD SMS INTEGRATION
        
        /* User Control Panel */
        app.post('/settings/set_profile_photo', cors(), controllers.settingsController.set_profile_photo);
        app.post('/settings/set_biography', cors(), controllers.settingsController.set_biography);
        app.post('/settings/set_user_settings', cors(), controllers.settingsController.set_user_settings);
        app.post('/settings/get_user_settings', cors(), controllers.settingsController.get_user_settings);

     
        /* Signal functionality */
        app.post('/signal/signal', cors(), controllers.signalController.signal);

        /* Web App Controller */
        app.post('/info/get_profile', cors(), controllers.infoController.get_profile);

        /* Troubleshooting for anything else */
        app.post('/:any', cors(), (req, res) => { res.send({ "error": "notfound: " + req.params['any'].toLowerCase() }) });        
    }
}


module.exports = Router