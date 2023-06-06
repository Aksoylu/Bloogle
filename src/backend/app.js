const CONFIG = require('./config.js');
const ExpressWrapper = require('./wrapper.js');
const Router = require('./router.js');

/* Initialize Services */
const AuthService = require('./services/AuthService');
const MySqlService = require('./services/MySqlService');
const CacheService = require('./services/CacheService');
const StorageService = require('./services/StorageService');

/* Initialize Controllers */
const AccountController = require('./controller/accountController');
const SettingsController = require('./controller/settingsController');
const SignalController = require('./controller/signalController');
const InfoController = require('./controller/infoController');


/* Create Service Instances */
const cacheService = new CacheService(CONFIG.CACHE);
const mysqlService = new MySqlService(CONFIG.MYSQL);
const authService = new AuthService(mysqlService, cacheService);
const storageService = new StorageService(CONFIG.STORAGE);

/* Create Controller Instances */
const accountController = new AccountController(authService, mysqlService, cacheService);
const settingsController = new SettingsController(authService, mysqlService, storageService);
const signalController = new SignalController(authService);
const infoController = new InfoController(authService, mysqlService);

/* Crete an express instance using wrapper */
const app = ExpressWrapper.create();

/* Binding router rules */
Router.bind(app, {
  accountController: accountController,
  settingsController : settingsController,
  signalController : signalController,
  infoController : infoController
});

/* Starting-up backend microservice */
ExpressWrapper.start(app);