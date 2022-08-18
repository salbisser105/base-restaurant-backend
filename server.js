const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const multer = require('multer');

/*
*Importar rutas
*/
const usersRoutes = require('./routes/user_routes');

const port = process.env.PORT || 3000;
///Sirve para debuggear los posibles errores
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);



app.disable('x-powered-by');

app.set('port', port);

const upload = multer({
    storage: multer.memoryStorage()
});

/*
LLamado de las rutas
*/
usersRoutes(app, upload);


//Revisar ipconfig para encontrar la ip
server.listen(3000,'192.168.20.2' || 'localhost', function() {
    console.log('Aplicación de NOdeJS'+ process.pid + 'iniciada')

});

app.get('/', (req, res)=> {
    res.send('Ruta raiz del backend');
});

app.get('/test', (req, res)=> {
    res.send('Ruta raiz del backend test');
});

//Config para manejo de errores:
app.use((err, req, res,next)=>{
    console.log(err);
    res.status(err.status|| 500).send(err.stack); 
})

//200 Respuesta exitosa.
//404 URL no existe
//500 error interno del servidor