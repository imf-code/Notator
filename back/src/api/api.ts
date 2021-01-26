import { Router } from 'express';
import authRoutes from './auth';
import dbRoutes from './db';

export default (): Router => {
    const router = Router();
    router.use('/auth', authRoutes());
    router.use('/db', dbRoutes());
    return router;
}