import { Router } from 'express';
import { initializePayment } from '../controllers/payment.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/initialize', verifyToken, initializePayment);

export default router;
