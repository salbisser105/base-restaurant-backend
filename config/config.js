const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'bero'
});

db.connect(function(err){
    if (err) throw err;
    console.log('database connected');
});

module.exports = db;