let controller = {};
const query = require('../database/pool-conexion')
/**
 * @returns {view} Retorna vista de administrar anuncios 
 */
controller.renderAnuncios = (req, res) => { return res.render('admin/anuncios', {profile: req.session.user})}


/**
 * @param {Number} req.params.id Id del anuncio
 * @returns {JSON} Retorna JSON con el anuncio
 */
 controller.listarAnuncio = async (req, res) => {
    try {
        let {id} = req.params;
        let datos = await query(`SELECT * FROM anuncios WHERE id_anuncio = ${id}`);
        return res.json(datos[0])
    } catch (e) {
        console.log("controller.anuncios/ListarAnuncios Error: " + e);
    }
}

/**
 * @returns {JSON} Retorna JSON con los anuncios en DB
 */
controller.listarAnuncios = async (req, res) => {
    try {
        var condicion = '';
        let { estado } = req.body;
        if(estado) condicion += ` 
            WHERE estado = '${estado}' AND
            fecha_inicio <= CURRENT_DATE() AND
            fecha_fin >= CURRENT_DATE() AND
            hora_inicio <= CURRENT_TIME() AND
            hora_fin >= CURRENT_TIME()`;

        let datos = await query(`SELECT * FROM anuncios ${condicion} `);
        return res.json(datos)
    } catch (e) {
        console.log("controller.anuncios/ListarAnuncios Error: " + e);
    }
}
/** 
 * @param {String} titulo Título del anuncio
 * @param {String} contenido Contenido del anuncio
 * @returns {JSON} Retorna JSON con esta del proceso
*/
controller.crearAnuncio = async (req, res) => {
    try {
        let {titulo, contenido, fecha_inicio, fecha_fin, hora_inicio, hora_fin} = req.body;
        let sql = `INSERT INTO anuncios (titulo, contenido, fecha_inicio, fecha_fin, hora_inicio, hora_fin) 
        VALUES ('${titulo}', '${contenido}', '${fecha_inicio}', '${fecha_fin}', '${hora_inicio}', '${hora_fin}')`;
        await query(sql);
        return res.json({status: 'sucess', message: 'Anuncio creado exitosamente'});
    } catch (e) {
        console.log("controller.anuncios/crearAnuncio Error: " + e);
    }
}


controller.actualizarAnuncio = async (req, res) => {
    try {
        let id = req.params.id;
        let {titulo, contenido, fecha_inicio, fecha_fin, hora_inicio, hora_fin, estado} = req.body;
        let sql = `UPDATE anuncios SET 
                titulo = '${titulo}',
                contenido = '${contenido}',
                fecha_inicio = '${fecha_inicio}',
                fecha_fin = '${fecha_fin}',
                hora_inicio = '${hora_inicio}',
                hora_fin = '${hora_fin}',
                estado = '${estado}'
            WHERE id_anuncio = '${id}'`;
        await query(sql);
        return res.json({status: 'sucess', message: 'Anuncio editado exitosamente'});
    } catch (e) {
        console.log("controller.anuncios/actualizarAnuncio Error: " + e);
    }
}

module.exports = controller;