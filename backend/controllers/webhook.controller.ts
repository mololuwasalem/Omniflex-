import { Request, Response } from 'express';
import crypto from 'crypto';
import admin, { db } from '../db';
import dotenv from 'dotenv';

dotenv.config();

export const handlePaystackWebhook = async (req: Request, res: Response) => {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  const hash = crypto.createHmac('sha512', secret || '').update(req.body).digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body.toString());
  
  if (event.event === 'charge.success') {
    const { amount, reference } = event.data;
    const userId = event.data.metadata?.userId;

    if (userId) {
      try {
        await db.runTransaction(async (t) => {
          const userRef = db.collection('users').doc(userId);
          const userDoc = await t.get(userRef);

          if (userDoc.exists) {
            const currentBalance = userDoc.data()?.walletBalance || 0;
            const creditAmount = amount / 100; // Paystack amount is in kobo
            
            t.update(userRef, {
              walletBalance: currentBalance + creditAmount
            });

            const transRef = db.collection('transactions').doc();
            t.set(transRef, {
              userId,
              type: 'funding',
              amount: creditAmount,
              status: 'success',
              metadata: { reference, paystackData: event.data },
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        });
      } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).send('Internal Server Error');
      }
    }
  }

  res.status(200).send('OK');
};
