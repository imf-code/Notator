import path from 'path';
import fs from 'fs';
import express, { NextFunction, Request, Response } from 'express';
import http from 'http';
import https from 'https';

import routeApi from './api/api';
import bodyParser from 'body-parser';
import ExpressSession from 'express-session';
import { SessionStorage } from './entities/SessionStorage';
import { TypeormStore } from 'connect-typeorm';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { dbConnect } from './dbConnect';
import { getConnection } from 'typeorm';
import { Client } from './entities/Entities';
import bcrypt from 'bcrypt';
import Database from './db';

// Extended session interface
declare module 'express-session' {
    interface SessionData {
        passport?: {
            user: string;
        };
    }
}

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

(async () => {

    // Establish db connection
    const db = new Database;
    const dbConnection = await db.connect(dbCreds);

    // Passport setup
    passport.use(new LocalStrategy(
        (username, password, done) => {
            (async () => {
                const connection = getConnection();
                const user = await connection.manager.findOne(Client, {
                    where: [{
                        name: username
                    }]
                });

                if (!user) {
                    done(null, false, { message: 'No such user.' });
                    return;
                }

                if (await bcrypt.compare(password, user.hash)) {
                    done(null, user)
                    return;
                }
                else {
                    done(null, false, { message: 'Invalid password.' });
                    return;
                }

            })().catch(err => {
                done(err);
                return;
            });
        }
    ));

    passport.serializeUser((user: any, cb) => {
        const userId = user.id as string;
        cb(null, userId);
    });

    passport.deserializeUser((id, cb) => {
        const userId = String(id);
        (async () => {
            const connection = getConnection();
            const user = await connection.manager.findOne(Client, {
                where: [{
                    id: userId
                }]
            });
            cb(null, user);

        })().catch(err => {
            console.log(err);
            cb(err);
            return;
        });
    });

    // Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    await (async () => {
        if (!dbConnection) {
            console.log('No db connection. Sessions unavailable.');
            return;
        }

        const sessionRepo = dbConnection.getRepository(SessionStorage);
        return app.use(ExpressSession({
            secret: process.env.SESSION_SECRET as string,
            saveUninitialized: false,
            resave: false,
            store: new TypeormStore({
                cleanupLimit: 2,
                ttl: 3600000
            }).connect(sessionRepo),
            cookie: {
                maxAge: 3600000,
                httpOnly: true,
                secure: true
            }
        }));
    })();

    app.use(passport.initialize());
    app.use(passport.session());

    function sessionAuth(req: Request, res: Response, next: NextFunction) {
        
    }

    // Testing
    app.post('/test',
        passport.authenticate('local'),
        (req, res) => {
            console.log(req.session);
            res.sendStatus(200);
        });

    app.get('/test2', (req, res) => {
        (async () => {
            console.log(await db.findOne(req.session.passport?.user, true));
        })();
        res.sendStatus(200);
    });

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

})();