import { Router, raw } from 'express';
import { handlePaystackWebhook } from '../controllers/webhook.controller';

const router = Router();

router.post('/paystack', raw({ type: 'application/json' }), handlePaystackWebhook);

export default router;
