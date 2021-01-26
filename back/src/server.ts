// Node modules
import path from 'path';
import fs from 'fs';
import express from 'express';
import http from 'http';
import https from 'https';

// API
import routeApi from './api/api';

// DB
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { Client, Note, Topic } from './entities/Entities';
// import * as Entities from './entities/Entities';

require('dotenv').config();

// Server setup
const app = express();
const port = 80;
const sPort = 443;

// Dev SSL
const key = fs.readFileSync(path.join(__dirname, '..', 'localhost.key'), 'utf8');
const cert = fs.readFileSync(path.join(__dirname, '..', 'localhost.crt'), 'utf8');
const creds = { key: key, cert: cert };

// Redirect to https (doesn't work with Heroku?)
app.use(function (req, res, next) {
    if (!req.secure) {
        return res.redirect(301, 'https://' + req.hostname + req.url);
    }
    next();
});

// Api routing
app.use('/api', routeApi());

// Static server folder
app.use(express.static(path.join(__dirname, 'test')));

// Start listening
const httpServer = http.createServer(app);
const httpsServer = https.createServer(creds, app);
httpsServer.listen(sPort, () => {
    console.log('HTTPS server running on port: ' + sPort);
});
httpServer.listen(port, () => {
    console.log('HTTP server running on port: ' + port);
})

// app.listen(port, () => {
//     console.log('Server running on port: ' + port);
// });

// createConnection({
//     type: 'postgres',
//     host: process.env.PGHOST,
//     port: Number(process.env.PGPORT),
//     username: process.env.PGUSER,
//     password: process.env.PGPASSWORD,
//     database: process.env.PGDATABASE,
//     entities: [
//         Client,
//         Note,
//         Topic
//     ],
//     synchronize: true,
//     logging: false
// }).then(connection => {

//     let newUser = new Client;
//     newUser.name = 'Testaaja';
//     newUser.token = 'Foo';

//     connection.manager.save(newUser)
//         .then(t => console.log(`Done! ID = ${t.id}.`))
//         .catch(err => console.log(err));

// }).catch(err => console.log(err));