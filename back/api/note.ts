import { Router, Request } from 'express';
import Database from '../db';

export default (): Router => {
    const db = new Database;
    const router = Router();

    router.get('/', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }

        const userId = req.id;

        (async () => {
            const userData = await db.findDataById(userId);

            userData ?
                res.status(200).send(userData.subjects) :
                res.sendStatus(500);

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    router.post('/subj', (req: Request, res) => {
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

    router.delete('/subj', (req: Request, res) => {
        if (!req.id || !req.body.subject) {
            res.sendStatus(500);
            return;
        }

        const userId = req.id;
        const subId = req.body.subject;

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