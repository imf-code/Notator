import { Router } from 'express';
import authRoutes from './auth';
import { auth } from '../middleware';
import note from './note';
import subject from './subject';
import topic from './topic';
import user from './user';

export default (): Router => {
    const router = Router();
    router.use('/auth', authRoutes());
    router.use('/user', auth, user());
    router.use('/subject', auth, subject());
    router.use('/topic', auth, topic());
    router.use('/note', auth, note());
    return router;
}