import { Router, Request } from 'express';
import Database from '../db';

export default (): Router => {
    const router = Router();
    const db = new Database;

    router.get('/all', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }

        const userId = req.id;

        (async () => {
            const userData = await db.findSubjects(userId);

            if (!userData) {
                res.sendStatus(500);
                return;
            }
            else {
                res.status(200).send(userData.subjects);
            }

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    router.post('/', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }
        if (!req.body.subject) {
            res.status(400).send('Enter name for new subject.');
            return;
        }

        const userId = req.id;
        const subject = String(req.body.subject);

        (async () => {
            const insert = await db.createSubject(userId, subject);

            res.status(201).send(insert.identifiers);

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    router.patch('/order/:subId', (req:Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }
        if (!req.body.order) {
            res.status(400).send('New order required.');
            return;
        }

        const userId = req.id;
        const subId = Number(req.params.subId);
        const order = String(req.body.order);

        (async () => {
            const update = await db.reOrderTopics(userId, subId, order);

            update.affected ?
                res.status(200).send({ id: subId }) :
                res.status(400).send('No such subject.');

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    router.patch('/:subId', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }
        if (!req.body.name) {
            res.status(400).send('New name required.');
            return;
        }

        const userId = req.id;
        const newName = String(req.body.name);
        const subId = Number(req.params.subId);

        (async () => {
            const update = await db.renameSubject(userId, subId, newName);

            update.affected ?
                res.status(200).send({ id: subId }) :
                res.status(400).send('No such subject.');

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    router.delete('/:subId', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }

        const userId = req.id;
        const subId = Number(req.params.subId);

        (async () => {
            const result = await db.delSubject(userId, subId);

            result.affected ?
                res.status(200).send({ id: subId }) :
                res.status(400).send('No such subject.');

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    return router;
}