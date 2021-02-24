import { Router } from 'express';
import Database from '../db';
import passport from 'passport';

export default (): Router => {
    const router = Router();
    const db = new Database;

    router.post('/signup', (req, res) => {
        if (!req.body.user || !req.body.pwd) {
            res.status(400).send('Both username and password required.');
            return;
        }

        // TODO: Check if pwd form is valid here

        const username = String(req.body.user).toLowerCase();
        const pwd = String(req.body.pwd);

        (async () => {
            if (await db.findUserByName(username)) {
                res.status(400).send('User already exists.');
                return;
            }
            else {
                await db.createUser(username, pwd) ?
                    res.status(201).send(`User ${username.toUpperCase()} was created successfully.`) :
                    res.sendStatus(500);
            }
        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    router.post('/login',
        passport.authenticate('local'),
        (req, res) => {
            res.sendStatus(200);
        });

    router.post('/logout', (req, res) => {
        if (!req.session.passport) {
            res.status(400).send('Not logged in.');
            return;
        }

        req.session.destroy(err => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            }
            else res.sendStatus(200);
        });
    });

    return router;
}