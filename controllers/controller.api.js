const query = require('../database/pool-conexion')
const path = require('path');
const fs = require('fs');
const controlador = {};


/**
 * Función que retorna foto del usuario / Control Acceso
 * @param {String}  /   Nombre del archivo de imagen de perfíl
 * @returns {ImageData} Retorna imagen de perfíl del usuario 
 */
controlador.returnPhoto = async(req, res) => {
    let filepath = path.join(path.resolve('./'), 'public', 'img', 'perfil', req.params.file);
    if(!fs.existsSync(filepath)) return res.status(404).json({status: 404, result: {msg: 'File not found:' + req.params.file}});    
    res.sendFile(filepath);
}


module.exports = controlador;