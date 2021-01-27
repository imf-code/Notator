import path from 'path';
import fs from 'fs';
import express from 'express';
import http from 'http';
import https from 'https';

import routeApi from './api/api';
import bodyParser from 'body-parser';

// DB
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import { Client, Note, Topic, Subject } from './entities/Entities';
// import * as Entities from './entities/Entities';

require('dotenv').config();

// Server setup
const app = express();
const port = 80;
const sPort = 443;

// Dev SSL
const key = fs.readFileSync(path.join(__dirname, '..', 'localhost.key'), 'utf8');
const cert = fs.readFileSync(path.join(__dirname, '..', 'localhost.crt'), 'utf8');
const ca = fs.readFileSync(path.join(__dirname, '..', 'myCA.crt'), 'utf8');
const creds = { key: key, cert: cert };

// DB connection
(async () => {
    await createConnection({
        type: 'postgres',
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT),
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        entities: [
            Client,
            Subject,
            Topic,
            Note
        ],
        ssl: {
            ca: ca,
            key: key,
            cert: cert
        },
        connectTimeoutMS: 10000,
        synchronize: true,
        logging: false
    }).then(() => {
        console.log('DB connection established.');
    }).catch((err) => {
        console.log(err);
    });
})();

// Redirect to https (doesn't work with Heroku?)
app.use(function (req, res, next) {
    if (!req.secure) {
        return res.redirect(301, 'https://' + req.hostname + req.url);
    }
    next();
});

// Use bodyparser
app.use(bodyParser.json());

// Test db
app.get('/test', (req, res) => {
    (async () => {
        const dbConnection = getConnection();

        const asdf = await dbConnection.manager.find(Client);
        console.log(asdf);
        res.sendStatus(200);
    })();
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
});