const query = require("../database/pool-conexion");
const controlador = {};

controlador.Abrir_Frm_Reserva = (req, res) => { res.render('reservas/reserva.ejs', { profile: req.session.user });}

controlador.Historial = (req, resp) => {resp.render('admin/historial-reservas', {profile: req.session.user});}

controlador.Listar_Todos_Productos = async(req, res) => {
    try {
        var sesion_Cargo = req.session.user.id_cargo;
        let filtro = '';
        let up = req.body.up;
        if(up) filtro += ` and codigo_up = '${up}'`;
        let sql = `
        select 
            id_inventario, Producto as producto, descripcion, 
            tipo, imagen,  reserva,  
            stock, MaxReserva,  hora_inicio,  
            hora_fin,  nomb_up as up,  medidas,  
            control_inventario,  promocion,  porcentaje,  
            precio,  Nombre as pv,  reserva_grupal,  punto_venta,
            (SELECT SUM(cantidad) 
                FROM detalle d 
                WHERE d.fk_id_inventario = id_inventario and d.estado = 'Reservado'
            ) as reservados,
            CURRENT_TIME() as hora_actual,
            estado
        from lista_productos 
        where idcargo = ${sesion_Cargo} 
        ${filtro}
        order by stock DESC, reserva, Producto` ;
        let productos = await query(sql);
        res.json(productos);
    } catch (e) {
        console.log("controller.reservas/Listar_Todos_Productos Error: " + e);
    }
}

controlador.Crear_Movimiento = async(req, res) => {
    var sesion_persona = req.session.user.identificacion;
    var punto_venta    = req.body.punto_venta;
    let sql = `call Administrar_Reserva('Buscar_Reserva', '${sesion_persona}', '${punto_venta}')`;
    try{
        let rows = await query(sql);
        return res.json(rows[0])
    } catch (e) {
        console.log("controller.reservas/Crear_Movimiento Error: " + e);
    }
}

controlador.Listar_Reservas_Pendientes = async(req, res) => {
    try {
        var sesion_persona = req.session.user.identificacion;
        let limite = req.body.limite;
        if(!limite) limite = 1000;
        let sql1 = `SELECT * FROM listamovimientos 
            where identificacion_m = '${sesion_persona}' 
            or identificacion = '${sesion_persona}'
            ORDER BY Estado ASC 
            LIMIT ${limite}`;
        let rows = await query(sql1);
        return res.json(rows);
    } catch (e) {
        console.log("controller.reservas/Listar_Reservas_Pendientes Error: " + e);
    }
}

controlador.Listar_Usuaios_Ficha = async(req, res) => {
    let sql = `SELECT identificacion,Nombres FROM personas where Ficha = '${req.body.idFicha}' and Estado = 1`
    try {
        let rows = await query(sql);
        if (rows.length <= 0) return res.json({ status: '404', message: 'Ficha no encontrada' })
        return res.json(rows)
    } catch (e) {
        console.log("controller.reservas/Listar_Usuaios_Ficha Error: " + e);
    }
}

controlador.Lista_Unidades_Reserva = async(req, res) => {
    try {
        let sql = `SELECT DISTINCT fk_codigo_up as up_id, up.Nombre as nombre FROM productos p
        JOIN unidades_productivas up ON up.codigo_up = p.fk_codigo_up`;
        let rows = await query(sql);
        return res.json(rows);
    } catch (e) {
        console.log("controller.reservas/Lista_Unidades_Reserva Error: " + e);
    }
}

controlador.Registrar_Detalle = async(req, res) => {
    var sesion_Cargo = req.session.user.id_cargo;
    var persona = req.body.persona;
    var cantidad = req.body.cantidad;
    var movimiento = req.body.id_movimiento;
    var inventario = req.body.id_producto;
    var subtotal = req.body.subtotal;
    try {
        let sql = `SELECT precio, control_inventario, stock,
                (SELECT SUM(cantidad) FROM detalle d WHERE d.fk_id_inventario = id_inventario and d.estado = 'Reservado') as reservados 
            from lista_productos 
            where id_inventario = '${inventario}' 
            and idcargo = ${sesion_Cargo}  LIMIT 1;`;
        let porcentajedb = `select porcentaje from lista_productos where id_inventario ='${inventario}' LIMIT 1;`;
        let rows = await query(sql);
        let rows2 = await query(porcentajedb);
        
        let producto = `SELECT Codigo_pdto, p.fk_categoria as id_categoria, p.valida_categoria,
        MaxReserva, inventario 
        FROM inventario i 
        join productos p on i.fk_codigo_pdto = Codigo_pdto 
        where id_inventario = '${inventario}'`;
        let producto_row = await query(producto);
        if (producto_row[0].MaxReserva < cantidad) return res.json({
            titulo: "Reserva superada",
            icon: "error",
            text: "Has superado el límite máximo de reserva"
        });
        if((parseInt(rows[0].reservados) + parseInt(cantidad))  > rows[0].stock 
        && rows[0].control_inventario == 'Si'){
            return res.json({
                titulo: "Reserva superada",
                icon: "error",
                text: "Ya no hay stock disponible del producto"
            });
        }
        
        // VALIDA SI EL PRODUCTO TIENE UNA CATEGORIA
        let cantidadPdto = '';
        if(producto_row[0].valida_categoria == 'Si'){
            cantidadPdto = `SELECT sum(cantidad) as cantidad FROM listamovimientos 
                where id_categoria = '${producto_row[0].id_categoria}' and identificacion = '${persona}'
            and Estado = 'Reservado'`;
            // SI TIENE CATEGORIA VALIDA EL PERIODO
            let obtiene_periodo = `
                SELECT  producto, Id_movimiento, periodo_res, Fecha_detalle, DATE_ADD(Fecha_detalle, INTERVAL periodo_res DAY) as sumafecha, if(
                    DATE_ADD(Fecha_detalle, INTERVAL periodo_res DAY) > NOW(), 'true', 'false'
                ) as intervalo_superado 
                FROM listamovimientos
                WHERE id_categoria = '${producto_row[0].id_categoria}'
                AND identificacion = '${persona}'
                AND Estado = 'Facturado'
                ORDER BY Fecha DESC LIMIT 1`;
            // VALIDA SI LA FECHA ACTUAL ES MAYOR A LA ULTIMA FECHA EN LA QUE SE COMPRÓ SUMANDO EL INTERVAO
            let periodo = await query(obtiene_periodo);
            if(periodo.length > 0 && periodo[0].intervalo_superado == 'true') return res.json({
                titulo: "Reserva superada",
                icon: "error",
                text: `Recuerda que el producto "${periodo[0].producto}" solo se puede reservar una vez cada ${periodo[0].periodo_res+1} días`
            });
        } else {
            cantidadPdto = `SELECT sum(cantidad) as cantidad FROM listamovimientos 
            where Codigo_pdto = '${producto_row[0].Codigo_pdto}' and identificacion = '${persona}'
            and Estado = 'Reservado'`;
        }
        let cantidadPdto_Rows = await query(cantidadPdto);
        if ((parseInt(cantidadPdto_Rows[0].cantidad) + parseInt(cantidad)) > parseInt(producto_row[0].MaxReserva)) return res.json({
            titulo: "Reserva superada",
            icon: "error",
            text: "Has superado el límite máximo de reserva"
        });        
        var precioProducto = rows[0].precio;
        if(!subtotal) subtotal = precioProducto * cantidad;
        var porcentajeProducto = rows2[0].porcentaje;
        /* =====consulta detalle======= */
        let sqlDetalle = `INSERT INTO detalle (cantidad, valor, Estado,entregado, Persona,fecha, porcentaje, subtotal, fk_Id_movimiento, fk_id_inventario) 
        VALUES (${cantidad}, ${precioProducto}, 'Reservado','No entregado',${persona},now(),${porcentajeProducto},${subtotal},${movimiento}, ${inventario})`;
        await query(sqlDetalle);

        return res.json({
            titulo: "Registro Exitoso",
            icon: "success",
            text: "La reserva ha sido registrada con éxito"
        });
    } catch (e) {
        console.log("controller.reservas/Registrar_Detalle Error: " + e.message);
        console.log(req.body);
    }
}
controlador.Eliminar_Detalle = async(req, res) => {
    var idDetalle = req.body.id_detalle;
    if (!req.body.id_detalle) return res.json({ status: 404, message: 'Detalle no encontrado' })
    let sql = `DELETE FROM detalle where id_detalle =` + idDetalle;
    try {
        await query(sql);
        return res.json({
            titulo: "Producto Eliminado",
            icon: "success",
            text: "Producto eliminado de reserva"
        });
    } catch (e) {
        console.log("controller.reservas/Eliminar_Detalle Error: " + e);
    }
}
module.exports = controlador;