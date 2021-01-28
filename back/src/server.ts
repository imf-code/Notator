import path from 'path';
import fs from 'fs';
import express from 'express';
import http from 'http';
import https from 'https';

import routeApi from './api/api';
import bodyParser from 'body-parser';
import ExpressSession from 'express-session';
import { TypeormStore } from 'connect-typeorm';

import { dbConnect } from './dbConnect';
import { SessionStorage } from './entities/SessionStorage';

// DEV
require('dotenv').config();
const key = fs.readFileSync(path.join(__dirname, '..', 'localhost.key'), 'utf8');
const cert = fs.readFileSync(path.join(__dirname, '..', 'localhost.crt'), 'utf8');
const ca = fs.readFileSync(path.join(__dirname, '..', 'myCA.crt'), 'utf8');
const creds = { key: key, cert: cert };
const dbCreds = { ca: ca, key: key, cert: cert }

// Server setup
const app = express();
const port = 80;
const sPort = 443;

// Establish db connection
const connectPromise = dbConnect(dbCreds);

// Middleware
app.use(bodyParser.json());
(async () => {
    const connection = await connectPromise;
    if (!connection) return;

    const sessionRepo = connection.getRepository(SessionStorage);

    app.use(ExpressSession({
        secret: process.env.SESSION_SECRET as string,
        saveUninitialized: false,
        resave: false,
        store: new TypeormStore({
            cleanupLimit: 2,
            ttl: 2592000
        }).connect(sessionRepo)
    }));
})();

// Routing
app.use(express.static(path.join(__dirname, 'test')));
app.use('/api', routeApi());

// Start server
const httpServer = http.createServer(app);
const httpsServer = https.createServer(creds, app);
httpsServer.listen(sPort, () => {
    console.log('HTTPS server running on port: ' + sPort);
});
httpServer.listen(port, () => {
    console.log('HTTP server running on port: ' + port);
});