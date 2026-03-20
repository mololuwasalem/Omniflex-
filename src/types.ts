export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  walletBalance: number;
  role: UserRole;
  createdAt: any;
}

export interface GiftCard {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  stock: number;
}

export interface GiftCardCode {
  id: string;
  giftCardId: string;
  code: string;
  isSold: boolean;
  soldTo?: string;
  soldAt?: any;
}

export type TransactionType = 'funding' | 'purchase';
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  metadata?: any;
  createdAt: any;
}
