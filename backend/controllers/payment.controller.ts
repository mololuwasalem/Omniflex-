import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const initializePayment = async (req: Request, res: Response) => {
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
};
