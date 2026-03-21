import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ShoppingBag, CreditCard, ChevronRight, Loader2, CheckCircle2, XCircle, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { initializePayment } from '../services/api';

export const Dashboard = () => {
  const { profile, user } = useAuth();
  const [fundingAmount, setFundingAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFundWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const amount = parseFloat(fundingAmount);
      if (isNaN(amount) || amount < 100) {
        throw new Error('Minimum funding amount is ₦100');
      }

      const data = await initializePayment(amount, user?.email || '', user?.uid || '');

      if (data.status) {
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { name: 'OmniFlex Wallet', value: `₦${profile?.walletBalance.toLocaleString() || '0'}`, icon: Wallet, color: 'bg-teal-600' },
    { name: 'Total Spent', value: '₦0', icon: ShoppingBag, color: 'bg-blue-600' },
    { name: 'Active Cards', value: '0', icon: CreditCard, color: 'bg-amber-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">OmniFlex Dashboard</span>
          <div className="h-px flex-1 bg-gray-100"></div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, {profile?.displayName || 'User'}!</h1>
        <p className="text-gray-500 mt-1">Manage your OmniFlex wallet and gift cards securely.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`${stat.color} p-3 rounded-xl`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fund Wallet Section */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Fund Wallet</h2>
              <p className="text-xs font-medium text-teal-600 uppercase tracking-wider">Powered by PayBridge</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-teal-600" />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleFundWallet} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
              <input
                type="number"
                required
                min="100"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Enter amount (min ₦100)"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-teal-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Fund Now with Paystack'}
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-400 text-center">
            Secured by Paystack. Instant funding after successful payment.
          </p>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <Link
            to="/gift-cards"
            className="group block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-teal-200 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-teal-50 p-3 rounded-xl group-hover:bg-teal-600 transition-colors">
                  <Gift className="w-6 h-6 text-teal-600 group-hover:text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Buy Gift Cards</p>
                  <p className="text-sm text-gray-500">Browse our collection of premium cards</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>
          </Link>

          <Link
            to="/transactions"
            className="group block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-600 transition-colors">
                  <History className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Transaction History</p>
                  <p className="text-sm text-gray-500">View your past purchases and fundings</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
};
