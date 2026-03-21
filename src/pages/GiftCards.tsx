import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { GiftCard } from '../types';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Loader2, Search, Filter, Tag, X, CheckCircle2 } from 'lucide-react';
import { buyGiftCard } from '../services/api';

export const GiftCards = () => {
  const { profile, user } = useAuth();
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<{ code: string; cardName: string } | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'gift_cards'), where('stock', '>', 0));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cardsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GiftCard));
      setCards(cardsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBuy = async (card: GiftCard) => {
    if (!profile || profile.walletBalance < card.price) {
      setError('Insufficient balance. Please fund your wallet to purchase this card.');
      return;
    }

    setBuying(card.id);
    setError('');

    try {
      const data = await buyGiftCard(user?.uid || '', card.id);
      setPurchaseResult(data);
    } catch (err: any) {
      let message = 'An unexpected error occurred. Please try again.';
      
      if (err.response) {
        // Server responded with a status code outside the 2xx range
        const backendError = err.response.data?.error;
        if (backendError === 'Insufficient balance') {
          message = 'Your wallet balance is too low for this purchase.';
        } else if (backendError === 'No codes available for this card' || backendError === 'Out of stock') {
          message = 'Sorry, this gift card is currently out of stock.';
        } else if (backendError === 'Code was just sold. Please try again.') {
          message = 'The last available code was just sold. Please try another card.';
        } else if (backendError) {
          message = backendError;
        }
      } else if (err.request) {
        // Request was made but no response was received
        message = 'Network error. Please check your internet connection and try again.';
      }
      
      setError(message);
    } finally {
      setBuying(null);
    }
  };

  const categories = ['All', ...Array.from(new Set(cards.map(c => c.category || 'Other')))];
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Premium Gift Cards</h1>
          <p className="text-gray-500 mt-1">Instant delivery to your dashboard after purchase.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all w-full md:w-64"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
          >
            <div className="aspect-video bg-gray-100 relative group overflow-hidden">
              <img
                src={card.imageUrl || `https://picsum.photos/seed/${card.name}/400/225`}
                alt={card.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-teal-600 shadow-sm">
                {card.category || 'Gift Card'}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{card.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{card.description || 'Premium gift card for your favorite services.'}</p>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Price</p>
                  <p className="text-xl font-bold text-gray-900">₦{card.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleBuy(card)}
                  disabled={buying === card.id || (profile?.walletBalance || 0) < card.price}
                  className="bg-teal-600 text-white p-3 rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-100"
                >
                  {buying === card.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Success Modal */}
      {purchaseResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Successful!</h2>
            <p className="text-gray-500 mb-6">Your {purchaseResult.cardName} code is ready.</p>
            
            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 mb-8">
              <p className="text-xs text-gray-400 uppercase font-bold mb-2">Gift Card Code</p>
              <p className="text-3xl font-mono font-bold text-teal-600 tracking-widest select-all">
                {purchaseResult.code}
              </p>
            </div>

            <button
              onClick={() => setPurchaseResult(null)}
              className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100"
            >
              Close & Continue
            </button>
            <p className="mt-4 text-xs text-gray-400">
              This code has also been saved to your transaction history.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
