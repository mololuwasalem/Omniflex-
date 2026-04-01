import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyGiftCards } from '../services/api';
import { Loader2, Gift, Copy, CheckCircle2, Calendar, CreditCard, ExternalLink, Search } from 'lucide-react';
import { format } from 'date-fns';

interface PurchasedCard {
  id: string;
  brand: string;
  code: string;
  value: number;
  purchaseDate: string | Date;
  expiryDate: string | Date;
}

export const MyGiftCards = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<PurchasedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCards = async () => {
      if (!user) return;
      try {
        const data = await getMyGiftCards(user.uid);
        setCards(data);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [user]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCards = cards.filter(card => 
    card.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Gift Cards</h1>
          <p className="text-gray-500 mt-1">View and manage all your purchased gift card codes.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search your cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all w-full md:w-64"
          />
        </div>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      {filteredCards.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No gift cards found</h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">
            {searchTerm ? "We couldn't find any cards matching your search." : "You haven't purchased any gift cards yet. Start shopping to see them here!"}
          </p>
          {!searchTerm && (
            <a
              href="/gift-cards"
              className="mt-8 inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100"
            >
              Browse Gift Cards
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                      <CreditCard className="w-6 h-6 text-teal-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{card.brand}</h3>
                      <p className="text-sm text-gray-500">Value: ₦{card.value.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Active
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6 relative group/code">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Redemption Code</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-mono font-bold text-teal-600 tracking-wider">
                      {card.code}
                    </p>
                    <button
                      onClick={() => handleCopy(card.code)}
                      className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-teal-600"
                      title="Copy code"
                    >
                      {copiedCode === card.code ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs font-medium flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" /> Purchased
                    </span>
                    <span className="text-gray-700 font-semibold">
                      {card.purchaseDate ? format(new Date(card.purchaseDate), 'MMM d, yyyy') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs font-medium flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" /> Expires
                    </span>
                    <span className="text-gray-700 font-semibold">
                      {card.expiryDate ? format(new Date(card.expiryDate), 'MMM d, yyyy') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium italic">
                  Redeemable at any {card.brand} outlet
                </span>
                <button className="text-teal-600 text-xs font-bold hover:underline">
                  How to redeem?
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
