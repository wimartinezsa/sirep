let express = require('express');
let servidor = express();
let bodyparser = require('body-parser');

var cors = require('cors');
servidor.use(cors());

servidor.use(express.static(__dirname + '/public'));
servidor.use(bodyparser.json());
servidor.use(bodyparser.urlencoded({ extended: false }));
servidor.set('view engine', 'ejs');
servidor.set('views', __dirname + '/views');

const dotenv = require('dotenv');
dotenv.config({path: './env/.env'});

const session = require('express-session');

servidor.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))

servidor.use(require('./routes/route.views'));
servidor.use(require('./routes/route.reservas'));
servidor.use(require('./routes/route.cliente')); 
/* ============== */
servidor.use(require('./routes/route.productos')); 
servidor.use(require('./routes/route.puntoventa')); 
servidor.use(require('./routes/route.unidadesproductivas')); 
servidor.use(require('./routes/route.inventario')); 
servidor.use(require('./routes/route.reportes'));
servidor.use(require('./routes/route.entrega')); 
servidor.use(require('./routes/route.movimientos')) 
servidor.use(require('./routes/route.produccion')) ;
servidor.use(require('./routes/route.anuncios'));

servidor.use('/api', require('./routes/route.api'));
servidor.get('*', (req, res) => {res.render('404')})

servidor.use('/auth', require('./routes/route.auth'));
servidor.listen(3000, () => {
    console.log('Servidor 3000 activo.')
});