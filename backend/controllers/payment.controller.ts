import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const initializePayment = async (req: Request, res: Response) => {
  const { amount, email, userId } = req.body;
  const secret = process.env.PAYSTACK_SECRET_KEY;

  const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (!secret) {
    console.error('PAYSTACK_SECRET_KEY is not defined in environment variables');
    return res.status(500).json({ error: 'Payment configuration error' });
  }

  if (!email || !parsedAmount || !userId || isNaN(parsedAmount)) {
    return res.status(400).json({ error: 'Missing or invalid required fields: email, amount, or userId' });
  }

  try {
    const rawAppUrl = process.env.APP_URL || 'http://localhost:3000';
    const appUrl = rawAppUrl.endsWith('/') ? rawAppUrl.slice(0, -1) : rawAppUrl;
    const payload = {
      email,
      amount: Math.round(parsedAmount * 100), // kobo, ensure it's an integer
      metadata: { 
        userId,
        description: 'OmniFlex Wallet Funding'
      },
      callback_url: `${appUrl}/dashboard`
    };

    console.log('Initializing Paystack with payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post('https://api.paystack.co/transaction/initialize', payload, {
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error: any) {
    const errorData = error.response?.data;
    console.error('Paystack init error:', JSON.stringify(errorData || error.message, null, 2));
    res.status(500).json({ 
      error: 'Failed to initialize payment',
      details: errorData?.message || error.message,
      type: errorData?.type
    });
  }
};
