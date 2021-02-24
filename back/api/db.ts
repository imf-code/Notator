import { Router } from 'express';

export default (): Router => {
    const router = Router();

    router.get(
        '/',
        (req, res) => {
            res.sendStatus(200);
        }
    )

    return router;

    // get /: return everything, includes user id and auth in body/cookie
    // post /: 
}