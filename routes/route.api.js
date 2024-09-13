let express = require('express');
let route = express.Router();
let controller = require('../controllers/controller.api')

route.get('/files/photos/:file', controller.returnPhoto);

module.exports = route;