const controladorMovimiento = {};
const query = require('../database/pool-conexion');

/**
 * @returns {render} Renderiza la vista de movimientos
 */
controladorMovimiento.renderMovimientos = async (req, resp) => {
    var sql = "select * from  cargo"
    let rows = await query(sql);
    resp.render('venta/movimientos', {Datos:rows, profile:req.session.user});
};

/**
 * @returns {render} Renderiza la vista de movimientos
 */
controladorMovimiento.renderCalendario = async (req, resp) => {
    resp.render('venta/calendario-factura', {profile:req.session.user});
};

/**
 * 
 * @returns {JSON} Retorna JSON con las fechas de las entregas
 */
 controller.listarFechas = async (req, res)=> {
    try {
        var IdPv = req.session.user.pv; 
        let estadoEntregado = req.body.entregado;
        let sql = `SELECT 
            (Fecha_entrega_detalle) AS fecha_entrega,
            count(*) as Entregas 
        FROM listamovimientos 
        where id_punto_vent = ${IdPv}
        and Estado = 'Facturado'
        and Estado_mov = 'Facturado'
        and	Entregado = '${estadoEntregado}' 
        group by Fecha_entrega_detalle`;
        let rows = await query(sql);
        return res.json(rows);
    } catch (e) {
        console.log('controller.entrega/listarFechasEntrega Error: '+e);
    }
}

/**
 * Lista los productos pendientes por entregar de la up de la sesión / entrega-producto.ejs
 * @returns {JSON} Retorna JSON con los detalles
 */
controller.listarFacturas = async (req, res) => {
    var IdPv = req.session.user.pv; //SESION DE USUARIO
    var { fecha, entregado } = req.body; 
    var fecha_condicion = `DATE_FORMAT(d.fecha_entrega, "%Y-%m-%d") = CURDATE()`;
    if(fecha) fecha_condicion = `DATE_FORMAT(d.fecha_entrega, "%Y-%m-%d") = '${fecha}'`;
    if(!entregado) entregado = 'No entregado';
    let sql = `SELECT d.id_detalle, per.identificacion, per.Nombres, per.Ficha, per.Foto,
        p.Nombre as producto, d.cantidad, (d.cantidad * d.valor) as valor, d.Entregado as Estado, 
        d.fecha, ca.nombre_cargo
        FROM movimientos m 
            JOIN detalle d on d.fk_Id_movimiento = m.Id_movimiento 
            JOIN personas per on per.identificacion = d.Persona 
            JOIN cargo ca on ca.idcargo = per.Cargo 
            JOIN inventario i on i.id_inventario = d.fk_id_inventario JOIN productos p on 
        p.Codigo_pdto = i.fk_codigo_pdto 
        where i.fk_id_punto_vent  = ${IdPv}
        and m.Estado = 'Facturado' and d.Estado = 'Facturado' and d.Entregado = '${entregado}'
        and ${fecha_condicion}`;
    try {
        let rows = await query(sql);
        return res.json(rows);
    } catch(e){
        console.log('controller.entrega/listarPorEntregar Error: '+e);
    }
}

/**
 * Lista los productos del pv en sesión dependiendo del cargo enviado / movimientos.ejs
 * @param {Number} cargo  Id del cargo
 * @returns {JSON} Retorna JSON con los productos 
 */
controladorMovimiento.listarProductos = async (req, resp) => {
    try {
        let cargo = req.body.cargo;
        let sesion_pv = req.session.user.pv;
        let sql = `select * from lista_productos where Id_punto_vent  = '${sesion_pv}' and idcargo = '${cargo}'`;
        let rows = await query(sql);
        resp.json(rows);
    } catch (error) {
        console.log("controller.movimientos/listarProductos Error: " + error);
    }
};

/**
 * Obtiene el producto del precio asignado al producto / movimientos.ejs
 * @param {Number} codigop Código del producto 
 * @param {Number} cargo   Cargo del usuario
 * @returns {JSON} Retorna JSON con los productos
 */
controladorMovimiento.obtenerProductoPrecio = async (req, resp) => {
    var id = req.body.codigop;
    var cargo = req.body.cargo;
    try {
        let sql = `select * from lista_productos where id_inventario='${id}' and idcargo = '${cargo}'`;
        let rows = await query(sql);
        return resp.json(rows);
    } catch (error) {
        console.log("controller.movimientos/obtenerProductoPrecio Error: " + error);
    }
};

/**
 * Busca un usuario en base a la identificación / movimientos.ejs
 * @param {Number} iden Identificacion del usuario 
 * @returns {JSON} Retorna la información del usuario
 */
controladorMovimiento.filtro = async (req, resp) => {
    var iden = req.body.iden;
    try {
        let sql = `SELECT identificacion, Cargo, Nombres, c.nombre_cargo, p.Estado FROM personas p
        JOIN cargo c on c.idcargo = p.Cargo
        WHERE identificacion = ${iden}`;
        let rows = await query(sql);
        return resp.json(rows);
    } catch (error) {
        console.log("controller.movimientos/filtro Error: " + error);
    }
};

/**
 * Función que valida para crear un nuevo movimiento / movimientos.ejs
 * @param {Number} iden Identificacion del usuario 
 * @returns {JSON} Retorna JSON con la respuesta del procedimiento
 */
controladorMovimiento.genVenta = async(req, resp) => {
    let pPersona = req.body.iden;
    let op1 = "NuevaVenta";
    let movimiento = 0;
    let punto_venta = req.session.user.pv
    try {
        let sql = `CALL Administrar_Ventas('${op1}',${pPersona},'${movimiento}', '${punto_venta}')`;
        let rows = await query(sql);
        return resp.json(rows[0]);
    } catch (error) {
        console.log("controller.movimientos/genVenta Error: " + error);
    }
};

/**
 * Función que cambia de estado a rechazado un movimiento y los detalles enlazados a él / movimientos.ejs
 * @param {Number} id_movimiento Id del movimiento a rechazara
 * @param {String} descripcion   Descripción del rechazo del movimiento
 * @returns {JSON} Retorna JSON con estado de la petición
 */
controladorMovimiento.RechazarMovimiento = async (req, res) => {
    let idmovimiento = req.body.id_movimiento;
    let descripcion = req.body.descripcion;
    if(!idmovimiento.trim()) return res.json({status: 'error'})
    if(!descripcion.trim()) return res.json({status: 'error'})
    try{
        let update_movimiento = `UPDATE movimientos SET Estado = 'Rechazado' WHERE Id_movimiento = '${idmovimiento}'`;
        let update_detalle = `UPDATE detalle SET Estado = 'Rechazado', descripcion = '${descripcion}' WHERE fk_Id_movimiento  = '${idmovimiento}'`;
        await query(update_movimiento);
        await query(update_detalle);
        return res.json({status: 200})
    } catch(e){
        console.log("controller.movimientos/RechazarMovimiento Error: " + e);
    }
}


/**
 * Función que agrega un detalle a un movimiento / movimientos.ejs
 * @param {Number} canProd       Cantidad del producto 
 * @param {String} estadoEntega  Estado de la entrega (Entregado, No entregado) 
 * @param {Number} comprador     Identificación del comprador
 * @param {Number} movimiento    Id del movimiento
 * @param {Number} id_inventario Id del inventario
 * @param {Decimal} subtotal     Subtotal de la compra
 * @param {Number} canProd      Cantidad del producto
 * @param {Number} codCargo      Id del cargo del usuario en sesión
 * @returns {JSON} Retorna JSON con estado del proceso
 */
controladorMovimiento.agregarDetalle = async (req, resp) => {
    let cantidadProd = req.body.canProd;
    let estadoEntr = req.body.estadoEntega;
    let estadoProd = "Reservado";
    let comprador = req.body.comprador;
    let movimiento = req.body.movimiento;
    let inventario = req.body.id_inventario;
    let subtotal = req.body.subtotal;
    let cantidad = req.body.canProd;
    let cargo = req.body.codCargo;
    let fecha_entrega = req.body.fecha_entrega;

    console.log(req.body);

    if (!inventario || inventario == 'undefined') return console.log(inventario)
    try {
        let precios = `select id_inventario, precio, porcentaje, stock from lista_productos where id_inventario='${inventario}' and idcargo = '${cargo}'`
        let producto = `SELECT Codigo_pdto, MaxReserva, inventario FROM inventario i 
        join productos p on i.fk_codigo_pdto = Codigo_pdto where id_inventario = '${inventario}'`;
        
        let validar = `SELECT precio, control_inventario, stock,
        (SELECT SUM(cantidad) FROM detalle d WHERE d.fk_id_inventario = id_inventario and d.estado = 'Reservado') as reservados 
        from lista_productos where id_inventario = '${inventario}' LIMIT 1;`;
        let rows_precio = await query(precios);
        let rows_validar = await query(validar);
        let producto_row = await query(producto);
        let valorProd = rows_precio[0].precio;
        let stock = rows_precio[0].stock;
        let porcentaje = rows_precio[0].porcentaje;
        subtotal = valorProd * cantidad;
        if(porcentaje > 0) {
            descuento = subtotal * (porcentaje/100);
            subtotal = subtotal - descuento;
        }

        if((parseInt(rows_validar[0].reservados) + parseInt(cantidad)) > rows_validar[0].stock 
        && rows_validar[0].control_inventario == 'Si'){
            return resp.json({ status: 'error', message: 'Ya no hay ventas ni reservas disponibles del producto' })
        }
        if (cantidadProd > stock && producto_row[0].inventario == 'Si') {
            return resp.json({ status: 'error', message: 'Has superado el límite de stock de este producto' })
        }

        /* 
        // VALIDA QUE NO SE RESERVE MAS DEL MÁXIMO ESTABLECIDO POR PRODUCTO
        let cantidadPdto = `SELECT sum(cantidad) as cantidad FROM listamovimientos 
            where Id_movimiento = '${movimiento}' 
            and Codigo_pdto = '${producto_row[0].Codigo_pdto}' and identificacion = '${comprador}'
            and Estado = 'Reservado'`;
        let cantidadPdto_Rows = await query(cantidadPdto);
        if((parseInt(cantidadPdto_Rows[0].cantidad) + parseInt(cantidadProd)) > parseInt(producto_row[0].MaxReserva)) {
            return resp.json({status: 'error', message: 'Has superado el límite de stock de este producto'});
        } */
        
       
        let sql = `insert into detalle (
                cantidad, 
                valor, 
                Estado, 
                Entregado, 
                fecha, 
                Persona, 
                porcentaje, 
                subtotal, 
                fk_Id_movimiento, 
                fk_id_inventario,
                fecha_entrega
            )
            values(
                ${cantidadProd},
                ${valorProd}, 
                '${estadoProd}',
                '${estadoEntr}',
                now(), 
                ${comprador},
                ${porcentaje},
                ${subtotal},
                ${movimiento}, 
                ${inventario}, 
                '${fecha_entrega}'
            )`;
          
        await query(sql);
        return resp.json({
            status: 200,
            message: 'Registro realizado exitosamente'
        })
    } catch (error) {
        console.log("controller.movimientos/agregarDetalle Error: " + error);
    }
};

/**
 * Función que elimina el detalle en base a id / movimiento.ejs - global-scripts.js
 * @param {Number} idDetalle  
 * @returns {JSON} Retorna JSON con estado de la petición
 */
controladorMovimiento.eliminarDetalle = async (req, resp) => {
    let idDetalle = req.body.idDetalle;
    try {
        let sql = `delete from detalle where id_detalle = '${idDetalle}'; `;
        await query(sql);
        return resp.json({ status: 200 });
    } catch (error) {
        console.log("controller.movimientos/eliminarDetalle Error: " + error);
    }
};

/**
 * Lista los productos a la venta del usuario en sesión / movimientos.ejs
 * @returns {JSON} Retorna un json con los productos y sus precios
 */
controladorMovimiento.listarProductosVenta = async (req, resp) => {
    let sesion_pv = req.session.user.pv;
    let sql = `select id_inventario as codigo, 
    GROUP_CONCAT(nombre_cargo, ': $', precio, '|') as precio, Producto, 
    stock, estado from lista_productos where Id_punto_vent = '${sesion_pv}' and tipo = 'venta' 
    GROUP BY id_inventario;`;
    try {
        let rows = await query(sql);
        resp.json(rows);
    } catch (error) {
        console.log("controller.movimientos/listarProductosVenta Error: " + error);
    }
}


/**
 * Lista los movimientos que tienen el estado del parametro enviado / movimientos.ejs
 * @param {String} estado Estado a listar 
 * @returns {JSON} Retorna JSON con la información de los movimientos
 */
controladorMovimiento.listarMovimientos = async (req, resp) => {
    let sesion_punto = req.session.user.pv;
    let estado = req.params.estado;
    let condicion = '';
    
    switch (estado) {
        case 'Pendiente':
            condicion = `m.Estado = 'Facturado' and d.Estado = '${estado}'`;
            break;
    
        default:
            condicion = `m.Estado = '${estado}'`;
            break;
    }

    try {
        let sql = `select m.Id_movimiento,date_format(m.Fecha, "%d-%m-%Y") as Fecha , m.Estado,
        (select Nombres from personas where m.fk_persona=personas.identificacion)as personas, 
        m.fk_persona as identificacion,
        (select sum(subtotal) from detalle where fk_Id_movimiento = m.Id_movimiento 
        and (Estado = 'Facturado' or Estado = 'Reservado')) as total, 
        (SELECT COUNT(*) FROM detalle where m.Id_movimiento = detalle.fk_Id_movimiento) as detalles 
        from movimientos m LEFT JOIN detalle d ON d.fk_Id_movimiento = m.Id_movimiento 
        LEFT JOIN inventario i on i.id_inventario = d.fk_id_inventario 
        WHERE (${condicion}) and i.fk_id_punto_vent = '${sesion_punto}' 
        GROUP BY Id_movimiento`;
        let rows = await query(sql);
        return resp.json(rows);
    } catch (error) {
        console.log("controller.movimientos/listarMovimientos Error: " + error);
    }
}



/**
 * Lista los detalles de un movimiento / movimientos.ejs - factura.js
 * @param {Number} id_movimiento Id del movimiento 
 * @returns {JSON} Retorna JSON con los detalles
 */
controladorMovimiento.mostrarDetalle = async (req, resp) => {
    var id_movimiento = req.params.idmovimiento;
    var sesion_punto = req.session.user.pv;
    let sql = `SELECT Codigo_pdto, id_detalle, producto as Nombre, cantidad as Cantidad, 
        identificacion, Nombres, valor as VlrUnit, porcentaje, subtotal as VlrTotal, Estado as EstadoVenta, 
        Estado_mov as EstadoMov, Entregado, num_factura, Fecha_entrega_detalle as fecha_entrega
    FROM listamovimientos 
    where Id_movimiento = '${id_movimiento}' and id_punto_vent = '${sesion_punto}'
    and (Estado = 'Reservado' or Estado='Facturado' or Estado='Pendiente') `;
    try {
        let rows = await query(sql);
        return resp.json(rows);
    } catch (error) {
        console.log("controller.movimientos/mostrarDetalle Error: " + error);
    }
}

/**
 * Obtiene el detalle en base al id / movimientos.ejs
 * @param {Number} idDetalle Id del detalle 
 * @returns {JSON} Retorna JSON con los datos del detalle
 */
controladorMovimiento.obtenerDetalle  = async (req, resp) => {
    try {
        var idDetalle = req.body.idDetalle;
        var sql = `SELECT id_detalle, 
            nombre,
            codigo_pdto,
            cantidad,
            detalle.Entregado,
            detalle.Estado,
            DATE_FORMAT(fecha_entrega, "%Y-%m-%d") as fecha_entrega
            FROM detalle 
            JOIN inventario ON fk_id_inventario=id_inventario 
            JOIN productos ON Codigo_pdto=fk_codigo_pdto 
            where id_detalle="${idDetalle}"`;
        let rows = await query(sql);
        return resp.json(rows[0]); 
    } catch (error) {
        console.log("controller.movimientos/obtenerDetalle Error: " + error);
    }   
}

/**
 * Función que edita un detalle / movimientos.ejs
 * @param {Number} idDetalle Id de detalle a editar
 * @param {Number} cantidad  Cantidad del producto
 * @param {String} estado    Estado de entrega (Entregado, No Entregado) 
 * @returns {JSON} Retorna JSON con el estado de la respuesta
 */
controladorMovimiento.editarDetalle = async (req, resp) => {
    let {idDetalle, cantidad, entregado, estado, fecha_entrega} = req.body;
    try{
        var sql = `UPDATE detalle 
            SET cantidad =${cantidad},
            Entregado='${entregado}',
            Estado = '${estado}',
            fecha_entrega = '${fecha_entrega}'
        WHERE detalle.id_detalle=`+idDetalle;
        let rows = await query(sql);
        return resp.json(rows);   
    }catch (error) {
        console.log("controller.movimientos/editarDetalle Error: " + error);
    }
} 

/**
 * Función que cambia de estado el movimiento a facturado / movimientos.ejs
 * @param {Number} iden          Identificacion de la persona
 * @param {Number} Id_movimiento Id del movimiento
 * @returns {JSON} Retorna los JSON con los detalles del movimiento
 */
controladorMovimiento.FacturarMovimiento = async (req, resp) => {
    let op1 = "FacturarVenta";
    let pPersona = req.body.iden;
    let movimiento =req.body.Id_movimiento;
    try {
        let sql = `CALL Administrar_Ventas('${op1}',${pPersona},'${movimiento}', '0')`;
        let rows = await query(sql);
        return resp.json(rows[0]);
    } catch (error) {
        console.log("controller.movimientos/FacturarMovimiento Error: " + error);
    }
};

/**
 * Función que anula el movimiento / movimientos.ejs
 * @param {Number} Id_movimiento Id del movimiento
 * @returns {JSON} Retorna el estado del proceso
 */
controladorMovimiento.AnularMovimiento = async (req, resp) => {
    let movimiento = req.body.Id_movimiento;
    try {
        let sql = `update movimientos set Estado = 'Anulado' where Id_movimiento = '${movimiento}';`;
        let sql_movimiento = `SELECT Codigo_pdto, 
            id_detalle, 
            producto as Nombre, 
            cantidad as Cantidad, 
            identificacion, 
            Nombres, 
            valor as VlrUnit, 
            subtotal as VlrTotal, 
            Estado as EstadoVenta, 
            Entregado, 
            num_factura
        FROM listamovimientos where Id_movimiento = '${movimiento}'`;
        let detalles = await query(sql_movimiento);
        detalles.forEach(async(e) => {
            var sql_detalle_anular =  `CALL Administrar_Detalle_Venta('AnularDetalle','${e.id_detalle}')`;
            await query(sql_detalle_anular);
        });
        await query(sql);
        return resp.json({status: 200, message: 'Movimiento anulado con éxito'});
    } catch (error) {
        console.log("controller.movimientos/AnularMovimiento Error: " + error);
    }
}

/**
 * Cambia de estado a facturado un detalle y merma del stock / movimientos.ejs
 * @param {Number} id_detalle Id del detalle
 * @returns {JSON} Retorna la información de respuesta del proceso
 */
controladorMovimiento.FacturarDetalle  = async (req, resp) => {
    var id_detalle = req.body.id_detalle;
    var sql =  `CALL Administrar_Detalle_Venta('FacturarDetalle','${id_detalle}')`;
    try{
        let rows = await query(sql);
        return resp.json(rows[0]);
    } catch (error) {
        console.log("controller.movimientos/FacturarDetalle Error: " + error);
    }
}

/**
 * Cambia de estado a anulado el detalle y retorna el stock
 * @param {Number} id_detalle Id del detalle 
 * @return {JSON} Retorna la información de respuesta del proceso
 */
controladorMovimiento.EstadoAnulado =  async (req, resp) => {
    var id_detalle = req.body.id_detalle;
    var sql = `CALL Administrar_Detalle_Venta('AnularDetalle','${id_detalle}')`;
    try{
        let rows = await query(sql);
        return resp.json(rows[0]);
    } catch (error) {
        console.log("controller.movimientos/EstadoAnulado Error: " + error);
    }
}

/**
 * Función que autoriza al admin para anular un detalle
 * @param {String} login    Login del admin
 * @param {String} password Contraseña del admin   
 * @returns {JSON} Retorna JSON con la autorización
 */

controladorMovimiento.validarAdmin  = async (req, resp) => {
    let {login, password} = req.body;
    var sql = `select identificacion from personas WHERE Login = '${login}' 
    and Password = '${password}'`;
    try{
        let rows = await query(sql);
        if(rows.length > 0) return resp.json({status: '200', message: 'Usuaro admin autorizado'});
        else return resp.json({status: 'error_auth', message: 'Usuario admin no autorizado'})
    } catch(e){
        console.log("controller.movimientos/validarAdmin Error: " + e);
    }
}

module.exports = controladorMovimiento;