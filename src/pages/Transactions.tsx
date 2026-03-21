import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Transaction } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { History, ArrowUpRight, ShoppingBag, Loader2, Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(transData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-500 mt-1">Track all your wallet fundings and gift card purchases.</p>
      </header>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No transactions yet</h3>
          <p className="text-gray-500 mt-1">Your activities will appear here once you start using the platform.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  tx.type === 'funding' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {tx.type === 'funding' ? <ArrowUpRight className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {tx.type === 'funding' ? 'Wallet Funding' : `Bought ${tx.metadata?.giftCardName || 'Gift Card'}`}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {tx.createdAt?.toDate ? format(tx.createdAt.toDate(), 'MMM d, yyyy • HH:mm') : 'Just now'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      tx.status === 'success' ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  tx.type === 'funding' ? 'text-teal-600' : 'text-gray-900'
                }`}>
                  {tx.type === 'funding' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                </p>
                {tx.type === 'purchase' && tx.metadata?.codeId && (
                  <p className="text-xs text-teal-600 font-mono mt-1 bg-teal-50 px-2 py-1 rounded">
                    Code: {tx.metadata.codeId.slice(0, 8)}...
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
