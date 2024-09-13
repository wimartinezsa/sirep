const query = require('../database/pool-conexion.js');
const authConfig = require('../config/auth')
let jwt = require('jsonwebtoken');

let controller = {};

controller.renderLogin = (req, res) => {res.render('gastronomia/login', {profile: req.session.user})}
controller.renderAdmin = (req, res) => {res.render('gastronomia/admin', {profile: req.session.user})}
controller.Login = async (req, res) => {
    var sql =`select identificacion, Rol, Ficha from personas WHERE Login = '${req.body.user}' and password = '${req.body.password}'`;
    try{
        let user = await query(sql);
        if(user.length <= 0) return res.json({status: 'error', message: "Usuario o contraseña incorrecta"})
        let json = {
            id: user[0].identificacion,
            role: user[0].Rol,
            ficha: user[0].Ficha
        }
        let token = jwt.sign({user: json}, authConfig.secret, {expiresIn: authConfig.expires})
        var decoded = jwt.verify(token, authConfig.secret);
        return res.json({user:decoded.user, token})
    } catch(e) {
        console.log(e);
    }
    console.log(user)
}
controller.ListarGastronomia = async (req, res) => {
    let cargo = req.session.user.Cargo;
    let sql = `SELECT * FROM productos 
    JOIN precios on fk_producto = Codigo_pdto 
    JOIN cargo on fk_cargo = idcargo where fk_codigo_up = 1 and Estado = 'Activo' AND nombre_cargo = '${cargo}'`;
    let almuerzos = await query(sql);
    res.json(almuerzos)
}

module.exports = controller;