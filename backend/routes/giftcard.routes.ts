import { Router } from 'express';
import { buyGiftCard } from '../controllers/giftcard.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/buy', verifyToken, buyGiftCard);

export default router;
