import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';

import express from 'express';
import ExpressSession from 'express-session';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getConnection } from 'typeorm';
import { TypeormStore } from 'connect-typeorm';
import bcrypt from 'bcrypt';

import routeApi from './api/api';
import { SessionStorage } from './entities/SessionStorage';
import { Client } from './entities/Entities';
import Database from './db';

// Extend express request interfaces
declare module 'express-session' {
    interface SessionData {
        passport?: {
            user?: string;
        };
    }
}
declare module 'express' {
    interface Request {
        id?: string;
    }
}

// DEV
require('dotenv').config();
const key = fs.readFileSync(path.join(__dirname, 'localhost.key'), 'utf8');
const cert = fs.readFileSync(path.join(__dirname, 'localhost.crt'), 'utf8');
const ca = fs.readFileSync(path.join(__dirname, 'myCA.crt'), 'utf8');
const creds = { key: key, cert: cert };
const dbCreds = { ca: ca, key: key, cert: cert }

// Server setup
const app = express();
const httpPort = 80;
const httpsPort = 443;

(async () => {

    // Establish db connection
    const db = new Database;
    const dbConnection = await db.connect(dbCreds);

    // Passport setup
    passport.use(new LocalStrategy(
        (username, password, done) => {
            (async () => {
                const user = await db.findUserByName(username);

                if (!user) {
                    done(null, false, { message: 'No such user.' });
                    return;
                }
                else if (await bcrypt.compare(password, user.hash)) {
                    done(null, user);
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
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(helmet());

    // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    // see https://expressjs.com/en/guide/behind-proxies.html
    // app.set('trust proxy', 1);
    const limiter = rateLimit({
        windowMs: 24 * 60 * 60 * 1000,    // 1d
        max: 100
    });
    app.use('/api/auth/login', limiter);

    await (async () => {
        if (!dbConnection) {
            console.log('No db connection. Sessions unavailable.');
            return;
        }

        const sessionRepo = dbConnection.getRepository(SessionStorage);
        return app.use(ExpressSession({
            name: 'sessionCookie',
            secret: process.env.SESSION_SECRET as string,
            saveUninitialized: false,
            resave: false,
            store: new TypeormStore({
                cleanupLimit: 2,
                ttl: 31557600000        // 1y
            }).connect(sessionRepo),
            cookie: {
                maxAge: 31557600000,    // 1y
                httpOnly: true,
                secure: true
            },
            unset: 'destroy'
        }));
    })();

    app.use(passport.initialize());
    app.use(passport.session());

    // Redirect to https (doesn't work with Heroku?)
    app.use(function (req, res, next) {
        if (!req.secure) {
            return res.redirect(301, 'https://' + req.hostname + req.url);
        }
        next();
    });

    // Routing
    app.use('/api', routeApi());

    // Start server
    const httpServer = http.createServer(app);
    const httpsServer = https.createServer(creds, app);
    httpsServer.listen(httpsPort, () => {
        console.log('HTTPS server running on port: ' + httpsPort);
    });
    httpServer.listen(httpPort, () => {
        console.log('HTTP server running on port: ' + httpPort);
    });

})();