import { Router } from 'express';
import { getConnection } from 'typeorm';
import { Client } from '../entities/Client';
import bcrypt from 'bcrypt';

export default (): Router => {
    const router = Router();

    router.get(
        '/',
        (req, res) => {
            res.sendStatus(200);
        }
    )

    router.post('/signup', (req, res) => {
        if (!req.body.user || !req.body.pwd) {
            res.sendStatus(400);
            return;
        }

        // TODO: Check for username/pwd validity here

        const username = String(req.body.user).toLowerCase();
        const pwd = String(req.body.pwd);

        (async () => {
            const connection = getConnection();
            const user = await connection.manager.findOne(Client, {
                where: [{
                    name: username
                }]
            });

            if (user) {
                console.log(user);
                res.status(400).send('User already exists.');
                return;
            }

            const salt = await bcrypt.genSalt(11);
            const pwdHash = await bcrypt.hash(pwd, salt);

            const newUser = connection.manager.create(Client, {
                name: username,
                hash: pwdHash
            });

            await connection.manager.save(newUser);

            res.status(201).send(`User ${username} created successfully.`);

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    router.post(
        'login',
        (req, res) => {
            // body-parser
            // setup auth stuff
        }
    )

    return router;
}