import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0638535983', // Fallback to the one from setup
  });
}

const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Paystack Webhook needs raw body for signature verification
  app.post('/api/fund/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
    const hash = crypto.createHmac('sha512', secret || '').update(req.body).digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(req.body.toString());
    
    if (event.event === 'charge.success') {
      const { amount, customer, reference } = event.data;
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
  });

  app.use(express.json());

  // API Routes
  app.post('/api/fund/initialize', async (req, res) => {
    const { amount, email, userId } = req.body;
    const secret = process.env.PAYSTACK_SECRET_KEY;

    try {
      const response = await axios.post('https://api.paystack.co/transaction/initialize', {
        email,
        amount: amount * 100, // kobo
        metadata: { 
          userId,
          description: 'OmniFlex Wallet Funding'
        },
        callback_url: `${process.env.APP_URL}/dashboard`
      }, {
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json'
        }
      });

      res.json(response.data);
    } catch (error: any) {
      console.error('Paystack init error:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to initialize payment' });
    }
  });

  app.post('/api/buy', async (req, res) => {
    const { userId, giftCardId } = req.body;

    try {
      const result = await db.runTransaction(async (t) => {
        const userRef = db.collection('users').doc(userId);
        const cardRef = db.collection('gift_cards').doc(giftCardId);
        
        const [userDoc, cardDoc] = await Promise.all([t.get(userRef), t.get(cardRef)]);

        if (!userDoc.exists || !cardDoc.exists) {
          throw new Error('User or Gift Card not found');
        }

        const userData = userDoc.data()!;
        const cardData = cardDoc.data()!;

        if (userData.walletBalance < cardData.price) {
          throw new Error('Insufficient balance');
        }

        if (cardData.stock <= 0) {
          throw new Error('Out of stock');
        }

        // Find an unsold code
        const codesRef = db.collection('gift_card_codes')
          .where('giftCardId', '==', giftCardId)
          .where('isSold', '==', false)
          .limit(1);
        
        const codesSnapshot = await t.get(codesRef);

        if (codesSnapshot.empty) {
          throw new Error('No codes available for this card');
        }

        const codeDoc = codesSnapshot.docs[0];
        const codeData = codeDoc.data();

        // Update user balance
        t.update(userRef, {
          walletBalance: userData.walletBalance - cardData.price
        });

        // Update card stock
        t.update(cardRef, {
          stock: cardData.stock - 1
        });

        // Mark code as sold
        t.update(codeDoc.ref, {
          isSold: true,
          soldTo: userId,
          soldAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Record transaction
        const transRef = db.collection('transactions').doc();
        t.set(transRef, {
          userId,
          type: 'purchase',
          amount: cardData.price,
          status: 'success',
          metadata: { giftCardId, giftCardName: cardData.name, codeId: codeDoc.id },
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { code: codeData.code, cardName: cardData.name };
      });

      res.json(result);
    } catch (error: any) {
      console.error('Purchase error:', error.message);
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
