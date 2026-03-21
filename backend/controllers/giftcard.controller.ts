import { Request, Response } from 'express';
import admin, { db } from '../db';

export const buyGiftCard = async (req: Request, res: Response) => {
  const { userId, giftCardId } = req.body;
  
  // Security check: ensure the userId matches the authenticated user
  const decodedToken = (req as any).user;
  if (decodedToken.uid !== userId) {
    return res.status(403).json({ error: 'Unauthorized: UID mismatch' });
  }

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
};
