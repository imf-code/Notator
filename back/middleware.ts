import { NextFunction, Request, Response } from 'express';

/**
 * Session authentication middleware.
 */
export function auth(req: Request, res: Response, next: NextFunction) {
    if (req.session.passport?.user) {
        req.id = req.session.passport.user;
        next();
    }
    else {
        // TODO: handle not logged in properly
        res.status(400).send('Login required.');
    }
}