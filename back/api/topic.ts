import { Router, Request } from 'express';
import Database from '../db';

export default (): Router => {
    const router = Router();
    const db = new Database;

    router.get('/:subId/with-notes', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }

        const userId = req.id;
        const subId = Number(req.params.subId);

        if (Number.isNaN(subId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

        (async () => {
            const subData = await db.findTopicsAndNotes(userId, subId);

            if (!subData) {
                res.sendStatus(500);
                return;
            }
            else {
                res.status(200).send(subData.topics);
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
        if (!req.body.topic) {
            res.status(400).send('Enter name for new topic.');
            return;
        }
        if (!req.body.subId) {
            res.status(400).send('No subject ID provided.');
            return;
        }

        const userId = req.id;
        const subId = Number(req.body.subId);
        const topic = String(req.body.topic);

        if (Number.isNaN(subId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

        (async () => {
            const insert = await db.createTopic(userId, subId, topic);

            res.status(201).send(insert.identifiers);

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    router.patch('/order/:topicId', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }
        if (!req.body.order) {
            res.status(400).send('New order required.');
            return;
        }

        const userId = req.id;
        const topicId = Number(req.params.topicId);
        const newOrder = String(req.body.order);

        if (Number.isNaN(topicId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

        (async () => {
            const update = await db.reOrderNotes(userId, topicId, newOrder);

            update.affected ?
                res.status(200).send({ id: topicId }) : 
                res.status(400).send('No such topic.');

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    router.patch('/:topicId', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }
        if (!req.body.name) {
            res.status(400).send('No name provided.');
            return;
        }

        const userId = req.id;
        const topicId = Number(req.params.topicId);
        const newName = String(req.body.name);

        if (Number.isNaN(topicId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

        (async () => {
            const update = await db.renameTopic(userId, topicId, newName);

            update.affected ?
                res.status(200).send({ id: topicId }) :
                res.status(400).send('No such topic.');

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    router.delete('/:topicId', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }

        const userId = req.id;
        const topicId = Number(req.params.topicId);

        if (Number.isNaN(topicId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

        (async () => {
            const result = await db.delTopic(userId, topicId);

            result.affected ?
                res.status(200).send({ id: topicId }) :
                res.status(400).send('No such topic.');

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    return router;
}