const query = require('../database/pool-conexion');
const authConfig = require('../config/auth');
let jwt = require('jsonwebtoken');
module.exports = {
    async authToken(req, res, next) {
        if (!req.headers.authorization) {
            return res.json({ status: 401, msg: 'Not authorized' });
        } else {
            let token = req.headers.authorization.split(' ')[1];
            if (!token) return res.json({ status: 401, message: "Token is required" })
            try {
                jwt.verify(token, authConfig.secret, async (err, decoded) => {
                    if (err) return res.json({ status: 401, message: 'Not authorized' });
                    var sql = `select identificacion, Nombres, Correo, Rol, cargo.nombre_cargo as Cargo,
                    Cargo as id_cargo, Ficha, Foto,
                    (SELECT codigo_up FROM unidades_productivas WHERE fk_persona = identificacion LIMIT 1) AS up_id, 
                    (SELECT Id_punto_vent FROM punto_venta WHERE fk_persona = identificacion LIMIT 1) as pv
                    from personas join cargo on Cargo = idcargo 
                    WHERE identificacion = '${decoded.user.id}'`;
                    let rows = await query(sql);

                    if (rows.length <= 0) return res.json({ status: 401, message: 'No found' })
                    req.session.user = rows[0];
                    if(req.session.up) req.session.user.up_id = req.session.up;
                    if(req.session.pv) req.session.user.pv = req.session.pv;
                    next();
                })
            } catch (e) {
                console.log("middleware.auth/authToken Error: " + e);
            }
        }
    },
    async authRoute(req, res, next) {
        token = req.session.token;
        if (!token) return res.redirect('/');
        try {
            jwt.verify(token, authConfig.secret, async (err, decoded) => {
                if (err) return res.redirect('/');
                var search_up = 'fk_persona = identificacion';
                var search_pv = 'fk_persona = identificacion';
                if(req.session.up) search_up = `codigo_up = '${req.session.up}'`;
                if(req.session.pv) search_pv = `Id_punto_vent = '${req.session.pv}'`;
                
                var sql = `select identificacion, Nombres, Correo, Rol, cargo.nombre_cargo as Cargo,
                Cargo as id_cargo, Ficha, Foto, Direccion, Telefono,
                (SELECT codigo_up FROM unidades_productivas WHERE fk_persona = identificacion LIMIT 1) AS up_id, 
                (SELECT Nombre FROM unidades_productivas WHERE ${search_up} LIMIT 1) as up_nombre,
                (SELECT Id_punto_vent FROM punto_venta WHERE fk_persona = identificacion LIMIT 1) as pv,
                (SELECT Nombre FROM punto_venta WHERE  ${search_pv} LIMIT 1) as pv_nombre
                from personas join cargo on Cargo = idcargo 
                WHERE identificacion = '${decoded.user.id}'`;
                let user = await query(sql);
                if (user.length <= 0) return res.redirect('/')
                req.session.user = user[0];
                if(req.session.up) req.session.user.up_id = req.session.up;
                if(req.session.pv) req.session.user.pv = req.session.up;
                next();
            })
        } catch (e) {
            return res.redirect('/')
        }
    },
    async isAdmin(req, res, next){
        if(req.session.user.Rol.trim() != 'Admin') return res.json({status: 401, message: 'Inautorizado'})
        next()
    },

    async isProduccion(req, res, next){
        if(req.session.user.Rol.trim() !='Produccion') return res.json({status: 401, message: 'Inautorizado'})
        next()
    },
    async isLiderUP(req, res, next){
        if(req.session.user.Rol.trim() != 'Lider UP' && req.session.user.Rol.trim() != 'Admin') return res.json({status: 401, message: 'Inautorizado'})
        next()
    },
    async isPv(req, res, next){
        if(req.session.user.Rol.trim() != 'Punto Venta' && req.session.user.Rol.trim() != 'Admin') return res.json({status: 401, message: 'Inautorizado'})
        next()
    }
}