
const { secure } = require('../helper.js');
const { HTTP_CODES } = require('../constants');


class SignalController {

    constructor(authService, elasticSearchService, matchService) {
        this.authService = authService;

    }

    /*  Tasks :
    *   gets users current matchlist as just user_id for notifications
    *   sets users lat-lon
    *   sets users last seen time
    */
    signal = (req, res) => {
        let data = {
            token: secure(req.body.token),
            lat: secure(req.body.lat),
            lon: secure(req.body.lon)
        };
        if (!data.token) {
            res.send({ result: "missing_parameter", code: HTTP_CODES.DATA_ERROR });
            return;
        }
        const user_details = this.authService.get_user(data.token, "*");
        if (!user_details) {
            res.send({ result: "not_authorized", code: HTTP_CODES.UNAUTHORIZED });
            return;
        }
        const user_id = user_details["id"];

    }

    


};

module.exports = SignalController