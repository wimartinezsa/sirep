let express = require('express');
let routeAuth = express.Router();
let auth = require('../middlewares/middleware.auth');
let controllerAuth = require('../controllers/controller.auth')

routeAuth.post('/login', controllerAuth.logIn);
routeAuth.post('/logout', controllerAuth.logOut);
routeAuth.post('/delete-profile-photo/:id', auth.authToken, controllerAuth.deletePhoto);
routeAuth.post('/change-profile/:id', auth.authToken, controllerAuth.CargarImagen, controllerAuth.editProfile);
routeAuth.post('/change-password', auth.authToken, controllerAuth.changePassword);
routeAuth.post('/recuperar-contrasenia', controllerAuth.recuperarContrasenia);

module.exports = routeAuth;