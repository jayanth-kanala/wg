import express from 'express';
const router = express.Router();
import Login from './controller';

router.post('/login', Login.authenticate);
router.post('/logout', Login.logout);

export default router;