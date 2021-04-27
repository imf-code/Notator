import { Router, Request } from 'express';
import Database from '../db';

export default (): Router => {
    const router = Router();
    const db = new Database;

    // Create a new topic
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
        const order = req.body.order as number[];

        if (!Array.isArray(order)) {
            res.status(400).send('Invalid order.')
            return;
        }

        if (Number.isNaN(subId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

        (async () => {
            const insert = await db.createTopic(userId, subId, topic);
            await db.reorderTopics(userId, subId, JSON.stringify([insert.identifiers[0].id, ...order]));

            res.status(201).send(insert.identifiers);

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    // Reorder notes under a topic
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
            const update = await db.reorderNotes(userId, topicId, newOrder);

            update.affected ?
                res.status(200).send({ id: topicId }) :
                res.status(400).send('No such topic.');

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    // Rename a topic
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

    // Delete a topic
    router.delete('/:topicId/:subId', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }

        const userId = req.id;
        const topicId = Number(req.params.topicId);
        const subId = Number(req.params.subId);

        if (Number.isNaN(topicId) || Number.isNaN(subId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

        (async () => {
            const subject = await db.findSubjectById(subId);
            if (!subject) {
                res.status(400).send('Invalid ID.');
                return;
            }
            const oldOrder = JSON.parse(subject.topicOrder) as number[];
            const newOrder = oldOrder.filter(id => id !== topicId);

            const result = await db.deleteTopic(userId, topicId);
            await db.reorderTopics(userId, subId, JSON.stringify(newOrder));

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