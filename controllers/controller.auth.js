const query = require('../database/pool-conexion.js');
const authConfig = require('../config/auth')
const jwt = require('jsonwebtoken');
const multer = require('multer-js');
const nodemailer = require("nodemailer");

const controllerAuth = {}
// PERSONAS
const storage = multer.diskStorage({
    destination: function(req, img, cb) {
        cb(null, "public/img/perfil");
    },
    filename: function(req, img, cb) {
        const nombre = req.params.id;
        req.fileNewName = nombre + '.png';
        cb(null, req.fileNewName);
    }
});
const upload = multer({ storage: storage });

controllerAuth.CargarImagen = upload.single('img');

function isValidEmail(mail) { 
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(mail); 
}



/**
 * Función que valida la información del usuario / Login
 * @param {String} user      Identificación del usuario
 * @param {String} password  Contraseña del usuario
 * @returns {JSON} Retorna JSON con la inforamción del usuario si la validación fue exitosa
 */
controllerAuth.logIn = async(req, res) => {
    try{
        /* ============CONSULTA QUE TRAE EL LOGIN DEL USUARIO QUE PASA COMO PARAMETRO============ */
        var sql =`SELECT identificacion, Nombres, Rol, c.nombre_cargo as Cargo, Ficha, Estado, Password 
            from personas
            JOIN cargo c on c.idcargo = Cargo 
        WHERE Login = '${req.body.user}'`;
        let rows =  await query(sql);
        /* ====FILAS DE LA CONSULTA */
        if(rows[0].Estado == 0) return res.json({status: 'errorIn', message: 'Usuario no se enccuentra activo'});
        if(rows.length <= 0) return res.json({status: 'error', message: 'User not found'});
        /* ====VALIDA LA CONTRASEÑA===== */
        if(req.body.password == rows[0].Password) compare = true;
        else compare = false;

        if(!compare) return res.json({status: 'error', message: 'User or password incorrect'});
        let json = {
            id: rows[0].identificacion,
            name: rows[0].Nombres,
            role: rows[0].Rol,
            cargo: rows[0].Cargo,
            ficha: rows[0].Ficha
        }
        if(json.role == 'Lider UP'){
            if(req.body.up) req.session.up = req.body.up;
            else {
                var ups = `SELECT * FROM unidades_productivas WHERE fk_persona = '${json.id}'`;
                let rowsUPS = await query(ups);
                if(rowsUPS.length > 1) return res.json({status: 'error_up',  message: 'Tiene asignada mas de una unidad productiva', data: rowsUPS});
                else {
                    if(rowsUPS[0]) req.session.up = rowsUPS[0].codigo_up;
                    else req.session.up = '';
                }
            }
        }
        if(json.role == 'Punto Venta'){
            if(req.body.pv) {
                req.session.pv = req.body.pv;
            }
            else {
                var pvs = `SELECT * FROM punto_venta WHERE fk_persona = '${json.id}'`;
                var rowsPVS = await query(pvs);
                if(rowsPVS.length > 1) return res.json({status: 'error_pv',  message: 'Tiene asignada mas de un punto de venta', data: rowsPVS});
                else {
                    if(rowsPVS[0]) req.session.pv = rowsPVS[0].Id_punto_vent;
                    else req.session.pv = '';
                }
            }
        }
        let token = jwt.sign({user: json}, authConfig.secret, {expiresIn: authConfig.expires});
        var decoded = jwt.verify(token, authConfig.secret);
        req.session.token = token;
        return res.json({user:decoded.user, token});
    } catch (e) {
        return res.json({status: 'error', message: 'Error with sql query: '+ e})
    } 
}

/**
 * Función que elimina la sesión del sistema / Logout
 * @returns {JSON} Retorna JSON con estado de éxito
 */
controllerAuth.logOut = (req, res) => { 
    req.session.destroy();
    return res.json({status: 'success'});
} 

/**
 * Edita la información del usuario en sistema / perfil.ejs
 * @param {Number|String} id La identificación del usuario 
 * @param {String} nomb      El nombre del usuario
 * @param {String} corre     El correo del usuario
 * @param {String} direcc    La direccion del usuario
 * @param {String} [tel]     EL teléfono del usuario
 * @param {String} [foto]    La foto del usuario
 * @returns 
 */
controllerAuth.editProfile = async (req, res) => {
    let id = req.params.id;
    let nomb = req.body.nombre;
    let corre = req.body.correo;
    let direc = req.body.direccion;
    let tel = req.body.telefono;
    let foto = req.fileNewName;
    try{
        if(!foto) foto = req.session.user.Foto;
        if(!foto) foto = 'default.png';
        // 
        var sql = `update personas set Nombres='${nomb}',Correo='${corre}',Direccion='${direc}',
        Telefono='${tel}', Foto = '${foto}' where identificacion=${id}`;
        await query(sql);
        return res.json({status: 'success', message: 'Perfil editado con éxito'})
    } catch(e) {
        console.log('controller.auth/editProfile Error: '+ e)
    }
}

/**
 * Elimina la foto del usuario en sistema / perfil.ejs
 * @param {Number|String} id La identificación del usuario+
 * @returns {JSON} Retorna JSON con el estado del sistema.
 */
controllerAuth.deletePhoto = async (req, res) => {
    try{
        let id = req.params.id;
        var foto = 'default.png';
        var sql = `update personas set Foto = '${foto}' where identificacion=${id}`;
        await query(sql);
        return res.json({status: 'success', message: 'Foto editada con éxito'})
    } catch(e) {
        console.log('controller.auth/deletePhoto Error: '+ e)
    }
}

/**
 * Cambia la contraseña del usuario en sesión / perfil.ejs
 * @param {String} actual_password La contraseña actual
 * @param {String} new_password    La nueva contraseña
 * @returns {JSON} Retorna JSON con estado de la petición y datos del usuario
 */
controllerAuth.changePassword = async (req, res) => {
    let token = req.session.token;
    let decoded = jwt.verify(token, authConfig.secret);
    let actual_password = req.body.actual_password;
    let new_password = req.body.new_password;
    if(!new_password) return res.json({status: 'error', message: 'New password cannot be empty'})
    var sql =`select Password from personas WHERE identificacion = '${decoded.user.id}'`;
    try{
        let rows = await query(sql);
        if(actual_password == rows[0].Password) compare = true;
        else compare = false;
        if(!compare) return res.json({status: 'error', message: 'La contraseña actual no coincide'})
        let pass_new = new_password;
        var sql_update =`update personas set password = '${pass_new}' WHERE identificacion = '${decoded.user.id}'`;
        //=========UPDATE PASSWORD============== 
        await query(sql_update)
        return res.json({status: 'success', message: 'Contraseña editada con éxito'})
    } catch (err) {
        return res.json({status: 'error', message: err.message});
    }
}


/**
 * Envia un correo con la contraseña actual / forgot-password.ejs
 * @param {String} / identificacion La identificación de persona
 * @return {JSON} Retorna JSON con el estado del mensaje enviado
 */
controllerAuth.recuperarContrasenia = async (req, res) => {
    let { identificacion } = req.body;
    
    let sql = `SELECT * FROM personas WHERE identificacion = '${identificacion}'`;
    try {
        let persona = await query(sql);
        if(!persona || persona.length <= 0) return res.status(400).json({status: 'error', message: 'Persona no encontrada'});
        if(!isValidEmail(persona[0].Correo)) return res.status(400).json({status: 'error', message: 'El correo no es válido'});
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
              user: 'sirep.sena@gmail.com', // generated ethereal user
              pass: 'mxczzjaulmsjhzgt' // generated ethereal password
            },
        });
    
        await transporter.sendMail({
            from: '"SIREP" <sirep.sena@gmail.com>', // sender address
            to: persona[0].Correo, // list of receivers
            subject: "Recuperación de contraseña - SIREP", // Subject line
            html: `<p>Tus credenciales de acceso son:</p>
            <p>Usuario: <b>${persona[0].Login}</b></p>
            <p>Contraseña: <b>${persona[0].password}</b></p>`, // html body
        });

        console.log("Message sent: %s", persona[0].Correo);
        return res.json({
            status: 'success', 
            message: 'Mensaje enviado exitosamene', 
            data: {
                nombre: persona[0].Nombres,
                correo: persona[0].Correo
            }
        });

    } catch (e) {
        console.log('controller.auth/recuperarContrasenia Error: '+ e)
        return res.status(400).json({status: 'error', message: 'Error al enviar el mensaje'});
    }
}


module.exports = controllerAuth;