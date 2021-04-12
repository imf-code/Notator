import { Router } from 'express';
import Database from '../db';
import passport from 'passport';

export default (): Router => {
    const router = Router();
    const db = new Database;

    // Signup
    router.post('/signup', (req, res) => {
        if (!req.body.username || !req.body.password) {
            res.status(400).send('Both username and password required.');
            return;
        }

        // TODO: Check if pwd form is valid here

        const username = String(req.body.username).toLowerCase();
        const pwd = String(req.body.password);

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

    // DEPRECATED
    router.get('/login_status',
        (req, res) => {
            if (!req.session.passport) {
                res.status(200).send(false);
            }
            else res.status(200).send(true);
        }
    )

    // Logout
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