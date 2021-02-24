import { Router } from 'express';
import authRoutes from './auth';
import note from './note';
import { auth } from '../middleware';

export default (): Router => {
    const router = Router();
    router.use('/auth', authRoutes());
    router.use('/note', auth, note());
    return router;
}