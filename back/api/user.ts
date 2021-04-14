import { Router, Request } from "express";
import Database from "../db";

export default (): Router => {
    const router = Router();
    const db = new Database;

    // Get user data for logged in user
    router.get('/', (req: Request, res) => {
        if (!req.id) {
            res.sendStatus(500);
            return;
        }

        const userId = req.id;

        (async () => {
            const user = await db.findUserById(userId);

            if (!user) {
                res.sendStatus(500);
                return;
            }
            else {
                res.status(200).send({
                    name: user.name
                });
            }
        })();
    });

    return router;
}