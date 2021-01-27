import { Router } from 'express';
import { getConnection } from 'typeorm';
import { Client } from '../entities/Client';
import bcrypt from 'bcrypt';

export default (): Router => {
    const router = Router();

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

    router.post('/login', (req, res) => {
        if (!req.body.user || !req.body.pwd) {
            res.sendStatus(400);
            return;
        }

        const username = String(req.body.user).toLowerCase();
        const pwd = String(req.body.pwd);

        (async () => {
            const connection =  getConnection();
            const user = await connection.manager.findOne(Client, {
                where: [{
                    name: username
                }]
            });

            if (!user) {
                res.status(404).send('User not found.');
                return;
            }

            if (await bcrypt.compare(pwd, user.hash)) {
                res.sendStatus(200);
                return;
            }
            else {
                res.status(400).send('Invalid password.');
                return;
            }

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    return router;
}