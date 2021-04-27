import { Router, Request } from 'express';
import Database from '../db';

export default (): Router => {
    const router = Router();
    const db = new Database;

    // Get a list of all subjects for a user
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

    // Get a all topics and notes under a subject
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
                res.status(200).send(subData);
            }

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    // Create a new subject
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

    // Reorder the topics under given subject
    router.patch('/order/:subId', (req: Request, res) => {
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

        if (Number.isNaN(subId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

        (async () => {
            const update = await db.reorderTopics(userId, subId, order);

            update.affected ?
                res.status(200).send({ id: subId }) :
                res.status(400).send('No such subject.');

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    // Rename a subject
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

        if (Number.isNaN(subId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

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

    // Delete a subject
    router.delete('/:subId', (req: Request, res) => {
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
            const result = await db.deleteSubject(userId, subId);

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