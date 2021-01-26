import { Router } from 'express';

export default (): Router => {
    const router = Router();

    router.get(
        '/',
        (req, res) => {
            res.sendStatus(200);
        }
    )

    router.post(
        'login',
        (req, res) => {
            // body-parser
            // setup auth stuff
        }
    )

    return router;
}