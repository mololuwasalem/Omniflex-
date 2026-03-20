import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { Database, Plus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const Admin = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const seedData = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const giftCards = [
        { name: 'Amazon Gift Card', price: 5000, category: 'Shopping', stock: 10, description: 'Shop millions of items on Amazon.com' },
        { name: 'iTunes Gift Card', price: 2500, category: 'Music', stock: 5, description: 'Get music, movies, and more on the iTunes Store' },
        { name: 'Google Play Card', price: 3000, category: 'Apps', stock: 8, description: 'Buy apps, games, and more on Google Play' },
        { name: 'Netflix Gift Card', price: 4500, category: 'Streaming', stock: 12, description: 'Watch your favorite movies and TV shows on Netflix' },
        { name: 'Steam Gift Card', price: 10000, category: 'Gaming', stock: 3, description: 'Buy games and software on the Steam platform' },
      ];

      for (const card of giftCards) {
        const cardRef = await addDoc(collection(db, 'gift_cards'), {
          ...card,
          imageUrl: `https://picsum.photos/seed/${card.name}/400/225`,
          createdAt: serverTimestamp()
        });

        // Add some codes for each card
        for (let i = 0; i < card.stock; i++) {
          const code = Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + 
                       Math.random().toString(36).substring(2, 10).toUpperCase();
          await addDoc(collection(db, 'gift_card_codes'), {
            giftCardId: cardRef.id,
            code,
            isSold: false,
            createdAt: serverTimestamp()
          });
        }
      }

      setStatus({ type: 'success', message: 'Database seeded successfully with 5 gift cards and their codes!' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-3xl mb-6 shadow-xl shadow-teal-100">
          <Database className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tighter">OmniFlex Admin Panel</h1>
        <p className="text-teal-600 font-bold uppercase tracking-[0.3em] text-xs -mt-2 mb-2">by PayBridge</p>
        <p className="text-gray-500 text-lg">Manage the platform data and system settings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Initialization</h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            If this is a new installation, you can seed the database with sample gift cards and codes to get started quickly.
          </p>
          
          {status && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm font-medium">{status.message}</span>
            </div>
          )}

          <button
            onClick={seedData}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-indigo-100"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Plus className="w-6 h-6" /> Seed Sample Data</>}
          </button>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Manual Management</h2>
          <p className="text-gray-500 text-sm mb-6">
            More admin features like manual card adding and user management are coming soon.
          </p>
          <button disabled className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl font-bold cursor-not-allowed">
            Coming Soon
          </button>
        </section>
      </div>
    </div>
  );
};
