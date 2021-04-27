import { Router, Request } from 'express';
import Database from '../db';

export default (): Router => {
    const router = Router();
    const db = new Database;

    // DEPRECATED
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

    // Create new note
    router.post('/', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }
        if (!req.body.note) {
            res.status(400).send('No note provided.');
            return;
        }
        if (!req.body.topicId) {
            res.status(400).send('No topic ID provided.');
            return;
        }

        const userId = req.id;
        const topicId = Number(req.body.topicId);
        const note = String(req.body.note);

        if (Number.isNaN(topicId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

        (async () => {
            const topic = await db.findTopicById(topicId);
            if (!topic) {
                res.status(400).send('Invalid ID.');
                return;
            }

            const insert = await db.createNote(userId, topicId, note);

            const oldOrder = JSON.parse(topic.noteOrder);
            const newOrder = [insert.identifiers[0].id, ...oldOrder];

            await db.reorderNotes(userId, topicId, JSON.stringify(newOrder));

            res.status(201).send(insert.identifiers);

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    // Update note text
    router.patch('/:noteId', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }
        if (!req.body.note) {
            res.status(400).send('No new note provided.');
            return;
        }

        const userId = req.id;
        const newNote = String(req.body.note);
        const noteId = Number(req.params.noteId);

        if (Number.isNaN(noteId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

        (async () => {
            const update = await db.updateNote(userId, noteId, newNote);

            update.affected ?
                res.status(200).send({ id: noteId }) :
                res.status(400).send('No such note.');

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    // Move note to another topic
    router.patch('/move/:noteId', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }
        if (!req.body.sourceOrder || !req.body.destinationOrder) {
            res.status(400).send('No order provided.');
            return;
        }

        const userId = req.id;
        const noteId = Number(req.params.noteId);
        const sourceId = Number(req.body.sourceId);
        const destinationId = Number(req.body.destinationId);
        const sourceOrder = String(req.body.sourceOrder);
        const destinationOrder = String(req.body.destinationOrder);

        if (Number.isNaN(sourceId) || Number.isNaN(destinationId) || Number.isNaN(noteId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

        (async () => {
            const update = await db.moveNote(userId, destinationId, noteId);
            await db.reorderNotes(userId, sourceId, sourceOrder);
            await db.reorderNotes(userId, destinationId, destinationOrder);

            update && update.affected ?
                res.status(200).send({ id: noteId }) :
                res.status(400).send('No such note.');

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    // Delete a note
    router.delete('/:noteId/:topicId', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }

        const userId = req.id;
        const noteId = Number(req.params.noteId);
        const topicId = Number(req.params.topicId);

        if (Number.isNaN(noteId) || Number.isNaN(topicId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

        (async () => {
            const topic = await db.findTopicById(topicId);
            if (!topic) {
                res.status(400).send('Invalid ID.');
                return;
            }

            const oldOrder = JSON.parse(topic.noteOrder) as number[];
            const newOrder = oldOrder.filter(id => id !== noteId);

            const result = await db.deleteNote(userId, noteId);
            await db.reorderNotes(userId, topicId, JSON.stringify(newOrder));

            result.affected ?
                res.status(200).send({ id: noteId }) :
                res.status(400).send('No such note.');

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    return router;
}