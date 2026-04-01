import { Router } from 'express';
import { buyGiftCard, getMyGiftCards } from '../controllers/giftcard.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/buy', verifyToken, buyGiftCard);
router.get('/my-cards/:userId', verifyToken, getMyGiftCards);

export default router;
