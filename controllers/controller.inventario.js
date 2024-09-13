const query = require('../database/pool-conexion');
const controlador = {};

/**
 * @returns {render} Retorna la vista para dar de baja
 */
controlador.render_dar_baja = async (req, res)=>{ res.render('inventario/dar-baja', {profile: req.session.user}); }

/**
 * Lista los productos que tienen STOCK / dar-baja.ejs
 * @returns {JSON} Retorna JSON con los productos que tienen stock
 */
controlador.Listar_Productos_Stock = async (req, res)=>{
    try {
        let sql = `SELECT id_Inventario as id_inventario,  
            p.Nombre as producto, 
            p.Descripcion as descripcion, 
            pv.Id_punto_vent as id_punto_venta, 
            pv.Nombre as punto_venta,
            i.stock
        FROM inventario i
            JOIN productos p on	   i.fk_codigo_pdto	= p.Codigo_pdto 
            JOIN punto_venta pv on i.fk_id_punto_vent = pv.Id_punto_vent 
        WHERE stock > 0;`
        let rows = await query(sql);
        return res.json(rows);
    } catch(e) {
        console.log('controller.inventario/Listar_Productos_Stock Error: '+e);
    }
}

/**
 * Función que genera un nuevo movimiento especial / dar-baja.ejs
 * @param {String} accion                 Acción que ejecutará el procedimiento 
 * @param {Number} id_punto_venta  Punto de venta al que se le asigna el movimiento 
 * @returns {JSON} Retorna JSON con el movimiento generado por el procedimiento
 */
controlador.movimientoEspecial = async (req, res) => {
    try {
        let {accion, id_punto_venta} = req.body;
        let persona = '';
        if(accion == 'DarBaja') {
            let sql_persona = `SELECT * FROM punto_venta WHERE Id_punto_vent = '${id_punto_venta}'`;
            let row_persona = await query(sql_persona);
            persona = row_persona[0].fk_persona;
        } else persona = req.body.persona;
        let sql = `call Administrar_Ventas('${accion}', ${persona}, 0, ${id_punto_venta})`;
        let rows = await query(sql);
        return res.json({id_movimiento: rows[0][0].Id_movimiento, persona});
    } catch(e) {
        console.log('controller.inventario/movimientoEspecial Error: '+e);
    }
}

/**
 * Función que genera un movimiento de tipo DarBaja o AutoConsumo / dar-baja.ejs
 * @param {String} operacion 
 * @param {Number} cantidad
 * @param {Number} identifiacion
 * @param {String} descripcion
 * @param {Number} movimientos
 * @param {Number} inventario
 * @returns {JSON} Retorna JSON con la información que retorna el procedimiento
 */
controlador.detalleEspecial = async (req, res) => {
    try {
        let {operacion, cantidad, identifiacion, descripcion, movimiento, inventario} = req.body;
        let sql = `call Detalles_Especiales('${operacion}', '${cantidad}', '${identifiacion}', '${descripcion}', '${movimiento}', '${inventario}')`;
        let rows = await query(sql);
        return res.json(rows[0]);
    } catch(e) {
        console.log('controller.inventario/detalleEspecial Error: '+e);
    }
    
}

/**
 * Función que asigna un producto a un punto de venta / produccionUp.ejs - inventario.ejs
 * @param {Number} id_producto    Id del producto
 * @param {Number} id_punto_venta Id del punto de venta
 * @returns {JSON} Retorna JSON con el estado del proceso
 */
controlador.registrarInventario = async (req, res)=>{
    try{
        let id_producto = req.body.id_producto;
        let id_punto_venta = req.body.id_punto_venta;
        var sql_validacion = `SELECT * FROM inventario WHERE fk_codigo_pdto = '${id_producto}' AND fk_id_punto_vent = '${id_punto_venta}'`;
        var sql = `insert into inventario(stock,fk_codigo_pdto,fk_id_punto_vent)values(0,'${id_producto}','${id_punto_venta}')`;
        let validacion = await query(sql_validacion);
        if(validacion.length >= 1) return res.json({status : "error", message : "Este producto ya se encuentra asginado a P.V"});
        await query(sql);
        return res.json({status : "success", message : "Producto asignado exitosamente"});
    } catch(e){
        console.log('controller.inventario/registrarInventario Error: '+e);
    }
}

/**
 * Función que lista lo distribuido de una producción  / produccionUp.ejs 
 * @param {Number} id_produccion Id de la producción  
 * @returns {JSON} Retorna JSON con las distribuciones 
 */
controlador.Listar_Distribucion = async (req, res)=>{
    try{
        let id_produccion = req.body.id_produccion;
        let sql =`select 
            punto_venta.Nombre as Nombrepunt, 
            bodega.id_bodega as id_bodega, 
            date_format(bodega.fecha, "%d-%m-%Y") as fechabodega, 
            bodega.cantidad as cantidadbodega 
        from produccion  
        join bodega on fk_produccion = Id_produccion 
        join inventario on fk_inventario=id_inventario 
        join punto_venta on fk_id_punto_vent=Id_punto_vent 
        where fk_produccion='${id_produccion}'`;
        let rows = await query(sql);
        return res.json(rows); 
    } catch(e){
        console.log('controller.inventario/Listar_Distribucion Error: '+e);
    }
}

module.exports = controlador;