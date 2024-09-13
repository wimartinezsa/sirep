const query = require('../database/pool-conexion')
const controlador = {};

/** 
 * @returns {render} Retorna vista de administración de usuarios
 */
controlador.renderRegistroCliente  = async (req, res) =>{
    try {
        var sql = "select * from  cargo";
        let rows = await query(sql);
        return res.render('admin/registro-cliente', {Datos:rows, profile: req.session.user})
    } catch(e) {
        console.log('controller.cientes/RenderRegistroCliente Error: '+ e)
    }
}

/** 
 * Lista los usuarios   / registro-cliente.ejs
 * @returns {JSON} Retorna un JSON con el listado de Usuarios
 */
controlador.Listar_Usuarios = async (req, res)=>{
    var sql = `SELECT identificacion,Nombres,Correo,Direccion,Telefono,Ficha,nombre_cargo as Cargo, Rol, if (Estado=1,'Activo','Inactivo') as Estado FROM personas join cargo on Cargo=cargo.idcargo where Rol != 'Admin'`;
    try{
        let rows = await query(sql);
        return res.json(rows);
    } catch(e){
        console.log('controller.cientes/Listar_Usuarios Error: '+ e)
    }
}

/**
 * Función que registra cliente en el sistema / registro-cliente.ejs - movimientos.ejs
 * @param {Number} id La identificación del usuario 
 * @param {String} nomb       El nombre del usuario 
 * @param {String} corre      El correo del usuario 
 * @param {String} [direccion]      La dirección del usuario
 * @param {Number|String} telefono  Telefono del usuario
 * @param {Number|String} ficha     Ficha del usuario
 * @param {Number|String} cargo     El cargo del usuario 
 * @param {String} rol        El rol del usuario [Invitado, Vocero, Lider UP, Punto Venta, Admin, Acceso]
 * @param {Boolean} estado    El estado del usuario
 * @param {String} sede       Sede del usuario   [Yamboro, Centro]
 * @returns {JSON} Retorna mensaje de éxito o de error en la operación
 */
controlador.RegistroCliente = async (req,res)=>{
    let ide = req.body.identificacion;
    let nomb = req.body.nombre;
    let corre = req.body.correo;
    let direccion = req.body.direccion;
    if(!direccion) direccion = '';
    let telefono = req.body.telefono;
    let ficha = req.body.ficha;
    let cargo = req.body.cargo;
    if(!cargo) cargo = 1;
    if(cargo != 1) ficha = 0;
    let rol = req.body.rol;
    if(!rol) rol = 'Invitado';
    let estado = req.body.estado;
    if(!estado) estado = 1;
    let user = req.body.identificacion;
    let sede = req.body.sede;
    // PASSWORD ENCRYPT
    let pas = ide;
    /*==================== inyeccion sql============ */
    var sql = `insert into personas(identificacion,Nombres,Correo,Login, Password,Direccion,Telefono,Ficha,Cargo,Rol,Estado, Sede)
     values(${ide},'${nomb}','${corre}','${user}','${pas}','${direccion}','${telefono}','${ficha}', '${cargo}','${rol}','${estado}', '${sede}')`;
    try{
        await query(sql);
        return res.json({status:200, msg: 'Registrado con Exito'});
    }catch(e){
        return res.json({status:400, msg: 'Error'+e});
    }
};

/**
 * Función que actualiza cliente en el sistema / registro-cliente.ejs
 * @param {Number|String} id La identificación del usuario 
 * @param {String} nomb       El nombre del usuario 
 * @param {String} corre      El correo del usuario 
 * @param {String} [direccion]      La dirección del usuario
 * @param {Number|String} [telefono]  Telefono del usuario
 * @param {Number|String} ficha     Ficha del usuario
 * @param {Number|String} cargo     El cargo del usuario 
 * @param {String} rol        El rol del usuario [Invitado, Vocero, Lider UP, Punto Venta, Admin, Acceso]
 * @param {Boolean} estado    El estado del usuario
 * @param {String} sede       Sede del usuario   [Yamboro, Centro]
 * @returns {JSON} Retorna mensaje de éxito o de error en la operación
 */
controlador.actualizar = async (req,res)=>{
    let ide = req.params.id;
    let new_ide = req.body.new_iden;
    let nomb = req.body.nombre;
    let corre = req.body.correo;
    let direc = req.body.direccion;
    let tel = req.body.telefono;
    let ficha = req.body.ficha;
    let cargo = req.body.cargo;
    let rol = req.body.rol;
    let sede = req.body.sede;
    let estado = req.body.estado;
    if(!ficha) ficha = 0;
    
    var sql = `update  personas set 
        Password = '${new_ide}',
        Login = '${new_ide}',
        identificacion = ${new_ide},
        Nombres='${nomb}',
        Correo='${corre}',
        Direccion='${direc}',
        Telefono='${tel}',
        Ficha='${ficha}',
        Cargo='${cargo}',
        Rol='${rol}',
        Sede='${sede}',
        Estado='${estado}' 
    where identificacion=${ide}`;
   try{
        await query(sql);
        return res.json({status:200, msg: 'Usuario actualizado con éxito'});
   }catch(e){
        console.log('controller.cientes/actualizar Error: '+ e) 
        return res.json({status:400, msg: 'Error'+e});
   }
}

/**
 * Busca el usuario con el parámtro de identificación / registro-cliente.ejs
 * @param {Number|String} iden  La identificación del usuario
 * @returns {JSON}              Retorna json con información del usuario 
 */
controlador.buscar = async (req,res)=>{
    var iden = req.body.identificacion;
    var sql =`select * from personas where identificacion='${iden}'`;
    try{
        let rows = await query(sql);
        if(rows.length > 0) return res.json(rows[0]);
        else return res.json([]);
    } catch(e){
        console.log('controller.cientes/buscar Error: '+ e)
    }
    
}

module.exports = controlador;