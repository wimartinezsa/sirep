const controlador = {};
const query = require('../database/pool-conexion');


// Listar las producciones cnfirmadas al Administrador
controlador.listarProduccionesConfirmadasAdmin = async (req, res) => {
    try{
        let sql = `SELECT * FROM lista_produccion_up 
                   WHERE Estado='Confirmado' and Disponible > 0 ORDER BY Id_produccion ASC`;     
        let rows = await query(sql);
        return res.json(rows);
    } catch (e){
        console.log("controller.produccion/listarProduccionesConfirmadasAdmin Error: " + e);
    }
}






// Se lista la producción regstrada por las unidades productivas(estado producción)
controlador.Listar_Produccion_UP = async (req, res) => {
    try{
        let  unidadproductiva = req.session.up;
        
        let sql = `
                    SELECT
                    pd.Id_produccion AS Id_produccion,
                    DATE_FORMAT(pd.fecha,"%d-%m-%Y") as fecha,
                    pr.Codigo_pdto AS Codigo_pdto,
                    pr.Nombre AS producto,
                    pd.Estado AS Estado,
                    up.codigo_up AS codigo_up,
                    up.Nombre AS nomb_up,
                    pd.Cantidad AS Producido,
                    pr.medidas,
                    pd.Observacion
                FROM produccion pd
                JOIN productos pr ON pr.Codigo_pdto=pd.fk_codigo_pdto
                JOIN unidades_productivas up ON up.codigo_up=pr.fk_codigo_up 
                WHERE (pd.Estado='Produccion') and up.codigo_up=${unidadproductiva}
                order by Id_produccion desc 
              `
        //let sql = `SELECT * FROM lista_produccion_up WHERE Disponible > 0 ORDER BY Id_produccion ASC`;
        let rows = await query(sql);
        return res.json(rows);
    } catch (e){
        console.log("controller.produccionUp/Listar_Produccion_UP Error: " + e);
    }
}


// Se lista la producción pendiente por confirmar
controlador.Listar_Produccion_Por_Confirmar = async (req, res) => {
    try{
       
        let sql = `SELECT * FROM lista_produccion_up 
                   WHERE Estado='Produccion' ORDER BY Id_produccion ASC`;
        let rows = await query(sql);
        return res.json(rows);
    } catch (e){
        console.log("controller.produccion/Listar_Produccion_Pendiente Error: " + e);
    }
}


// Se lista la producción pendiente por distribuir
controlador.Listar_Produccion_Por_Distribuir = async (req, res) => {
    try{
       
        let sql = `SELECT * FROM lista_produccion_up 
                   WHERE inventario='Si' and Estado='Confirmado' and Disponible > 0 ORDER BY Id_produccion ASC`;
        let rows = await query(sql);
        return res.json(rows);
    } catch (e){
        console.log("controller.produccion/Listar_Produccion_Pendiente Error: " + e);
    }
}



controlador.RechazarProduccion = async (req,res)=>{
    try {    
        let idProduccion = req.params.idProduccion;
        let     sql= `update produccion set Estado='Rechazado' where Estado='Produccion' and Id_produccion=${idProduccion} `;
        await query(sql);
        return res.json({
            titulo: "Rechazo exitoso",
            icono: "success",
            mensaje: "Se rechazó la producción con exito"
        });   
    } catch (e) {
        console.log("controller.produccion/RechazarProduccion Error: " + e);
    }
}



controlador.ConfirmarProduccion = async (req,res)=>{
    try {    
        let idProduccion = req.params.idProduccion;
        let {ValorUnitario,ValorTotal,observacion} = req.body;
        let     sql= `update produccion set Estado='Confirmado',valorunit ='${ValorUnitario}',
                      valortotal ='${ValorTotal}',Observacion ='${observacion}'
                      where Estado='Produccion' and Id_produccion=${idProduccion}`;
      console.log(sql);

        await query(sql);
        return res.json({
            titulo: "Confirmación exitosa",
            icono: "success",
            mensaje: "Se confirmó la producción con exito"
        });   
    } catch (e) {
        console.log("controller.produccion/ConfirmarProduccion Error: " + e);
    }
}






controlador.Asignar_Inventario = async (req, res) => {
    try {
        let operacion = 'ActualizarBodega';
        let cantidad = req.body.cantidad;
        let id_punto_venta = req.body.punto_venta;
        let id_produccion  = req.body.id_produccion;
        let inventory_query = `SELECT id_inventario, Id_produccion as id_produccion,
                Codigo_pdto as id_producto, Producido, Distribuido, Disponible,
                fk_id_punto_vent as id_punto_venta
            FROM lista_produccion_up lup 
                JOIN inventario i on lup.Codigo_pdto = i.fk_codigo_pdto
            WHERE fk_id_punto_vent = '${id_punto_venta}' and Id_produccion = '${id_produccion}'`;
        let inventory_rows = await query(inventory_query);
        // Obtiene el id del inventario por consulta
        let id_inventario = inventory_rows[0].id_inventario;
        //-----------------------------------------
        let disponible = inventory_rows[0].Disponible;
        let distribuido = inventory_rows[0].Distribuido;
        if(!distribuido) distribuido = 0;
        //-----------------------------------------
        if(cantidad > disponible) return res.json({status: 'error', message: 'La cantidad supera el stock'});
        // Realiza la operación en el procedimiento
        let sql = `CAll Administrar_inventario('${operacion}',${cantidad},${id_produccion},${id_inventario})`;
        await query(sql);
        return res.json({status: 'success', message: 'Distribución asignada exitosamente'});
        
    } catch (e) {
        console.log("controller.produccion/Asignar_Inventario Error: " + e);
    }
}





// Se listan los puntos de venta que tenaga asignado el producto para la venta
controlador.Listar_Punto_Venta_Producto = async (req, res) => {
    try {
        let producto = req.body.producto;
        let sql = `SELECT DISTINCT Id_punto_vent,Nombre FROM inventario inv
        join punto_venta pv on pv.Id_punto_vent=inv.fk_id_punto_vent
        where fk_codigo_pdto ='${producto}'`;
        let rows = await query(sql);
        return res.json(rows);
    } catch (e) {
        console.log("controller.produccion/Listar_Punto_Venta_Producto Error: " + e);
    }
}


controlador.listarTodosPuntosVenta = async (req, res) => {
    try{
        var sql = `select pv.Estado as EstadoPVent, 
                Id_punto_vent, pv.Sede,Nombre,Nombres,fk_persona, 
                personas.Direccion as dirPersona, 
                pv.Direccion as dirPunto 
            from punto_venta as pv
            join personas on fk_persona=identificacion`;
        let rows = await query(sql);
        return res.json(rows)
    }
    catch(e){
        console.log("controller.puntoventa/ListaPuntoventa Error: " + e);
    }
};




/*
controlador.Listar_Produccion = async (req,res)=>{
    try{
        var idup = req.body.unidad;
        var sql = `select Id_produccion,Cantidad,DATE_FORMAT(produccion.fecha,'%d-%m-%Y') as fecha,
        Observacion, productos.Nombre, productos.Descripcion
        from produccion join productos on Codigo_pdto = fk_codigo_pdto where fk_codigo_up='${idup}'`;
        let rows = await query(sql);
        return res.json(rows);
    }
    catch(e){
        console.log("controller.produccionUp/Listar_Produccion Error: " + e);
    }
}
*/

// listar todos los productos de la unidades productivas

controlador.consultarTodosProductos = async(req,res)=>{
    try {
        
        let sql = `select unidades_productivas.Nombre as nameup, 
                productos.Nombre as Namepdto, 
                productos.Descripcion as Descpdto,
                productos.Codigo_pdto as Codigo_pdto  
            from productos 
            join unidades_productivas on codigo_up=fk_codigo_up`; 

    
        let rows = await query(sql);
        return res.json(rows);
    } catch (e) {
        console.log("controller.produccionUp/llamarproductosUp Error: " + e);
    }
    
}




// ======================= Listar Productos de la up que inicio sesion =================================
controlador.consultarProductosUp = async(req,res)=>{
    try {

         let  unidadproductiva = req.session.up;
        
        let sql = `select unidades_productivas.Nombre as nameup, 
                productos.Nombre as Namepdto, 
                productos.Descripcion as Descpdto,
                productos.Codigo_pdto as Codigo_pdto  
            from productos 
            join unidades_productivas on codigo_up=fk_codigo_up 
            where fk_codigo_up ='${unidadproductiva}'`; 

    
        let rows = await query(sql);
        return res.json(rows);
    } catch (e) {
        console.log("controller.produccionUp/llamarproductosUp Error: " + e);
    }
    
}


// =========== listar Unidad Productiva==================

controlador.produccionAdmin = async (req,res)=>{
    try {
        let sql = `SELECT DISTINCT fk_codigo_up as codigo_up, up.Nombre FROM productos p 
        JOIN unidades_productivas up on up.codigo_up = p.fk_codigo_up WHERE up.estado = 'Activo';` // unidades productivas 
        let rows = await query(sql);
        return res.render('admin/produccionAdmin.ejs',{up:rows, profile: req.session.user});   
    } catch (e) {
        console.log("controller.produccion/Produccion Error: " + e);
    }
}

// =========== listar Unidad Productiva==================
controlador.produccionUp = async (req,res)=>{
    try {
       
        return res.render('admin/produccionUp.ejs',{profile: req.session.user});   
    } catch (e) {
        console.log("controller.produccionUp/Produccion Error: " + e);
    }
}

//=============Administrar producción por e encargado de producción=================
controlador.produccionConfirmar = async (req,res)=>{
    try {

        let sql = `SELECT DISTINCT fk_codigo_up as codigo_up, up.Nombre FROM productos p 
        JOIN unidades_productivas up on up.codigo_up = p.fk_codigo_up WHERE up.estado = 'Activo';` // unidades productivas 
        let rows = await query(sql);
        return res.render('admin/produccionConfirmar.ejs',{up:rows, profile: req.session.user});  
    } catch (e) {
        console.log("controller.produccionUp/produccionConfirmar Error: " + e);
    }
}

//=============registrar produccion =======================

controlador.RegistrarProduccion = async (req,res)=>{
    try {    
        let fecha = req.body.Fecha;
        let cant = req.body.Cantidad;
        let obs= req.body.Observacion;
        let fkp = req.body.fkp;
        
        let     sql= `insert into produccion(Cantidad,Observacion,fecha,fk_codigo_pdto,Estado)
        values('${cant}','${obs}','${fecha}','${fkp}','Produccion')`;
        await query(sql);
        return res.json({
            titulo: "Registro exitoso",
            icono: "success",
            mensaje: "La producción fue registrada con éxito"
        });   
    } catch (e) {
        console.log("controller.produccionUp/RegistrarProduccion Error: " + e);
    }
}

/*===========buscar produccion============== */

controlador.buscarProduccion = async (req,res)=>{
    try{
        let id_produccion = req.params.idProduccion;
        let sql = `select id_produccion, Cantidad, Nombre, observacion,fk_codigo_pdto,DATE_FORMAT(fecha,"%Y-%m-%d") as fecha 
        from produccion 
        join productos on Codigo_pdto=fk_codigo_pdto 
        where id_produccion ='${id_produccion}'`;
        let rows = await query(sql);
        return res.json(rows);
    }
    catch(e){
        console.log("controller.produccionUp/Buscarproduccion Error: " + e);
    }
}


controlador.editarProduccion = async (req,res)=>{
    try {
        let idProduccion = req.body.idProduccion;
        let fecha = req.body.Fecha;
        let cant = req.body.Cantidad;
        let obs= req.body.Observacion;
        let fkp = req.body.fkp;
        let sql= `update produccion set Cantidad='${cant}',Observacion='${obs}',fecha='${fecha}',fk_codigo_pdto=${fkp}
                  where Id_produccion = '${idProduccion}'`;
        await query(sql);
        return res.json({
            titulo: "Actualización exitosa",
            icono: "success",
            mensaje: "La producción fue actualizada con éxito"
        })
    } catch (e) {
        console.log("controller.produccionUp/editarProduccion Error: " + e);
    }
    
}

module.exports = controlador;