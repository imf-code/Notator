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
            const insert = await db.createNote(userId, topicId, note);

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
        if (!req.body.topicId) {
            res.status(400).send('No topic ID provided.');
            return;
        }

        const userId = req.id;
        const topicId = Number(req.body.topicId);
        const noteId = Number(req.params.noteId);

        if (Number.isNaN(topicId) || Number.isNaN(noteId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

        (async () => {
            const update = await db.moveNote(userId, topicId, noteId);


            update && update.affected ?
                res.status(200).send({ id: noteId }) :
                res.status(400).send('No such note.');

        })().catch(err => {
            console.log(err);
            res.sendStatus(500);
            return;
        });
    });

    // Delete note
    router.delete('/:noteId', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }

        const userId = req.id;
        const noteId = Number(req.params.noteId);

        if (Number.isNaN(noteId)) {
            res.status(400).send('Invalid ID.');
            return;
        }

        (async () => {
            const result = await db.delNote(userId, noteId);

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