import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'motion/react';
import { Gift, Mail, Lock, User, ArrowRight, Loader2, CreditCard } from 'lucide-react';

export const AuthPage = ({ mode }: { mode: 'login' | 'register' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl mb-6 shadow-xl shadow-teal-100 relative overflow-hidden">
            {/* Swirl effect */}
            <div className="absolute inset-0 border-4 border-white/20 rounded-full border-t-white animate-[spin_4s_linear_infinite] -m-4"></div>
            
            {/* Gold Card */}
            <div className="relative bg-amber-400 w-12 h-8 rounded-md shadow-lg flex items-center justify-center overflow-hidden">
              <div className="absolute top-1.5 left-1.5 w-3 h-2 bg-amber-600/30 rounded-full"></div>
              <CreditCard className="text-white w-6 h-6" />
              <div className="absolute top-1 right-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl font-extrabold tracking-tighter flex">
              <span className="text-gray-900">Omni</span>
              <span className="text-amber-500">Flex</span>
            </div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-[0.3em] mt-1">by PayBridge</span>
          </div>
          <p className="text-gray-500 mt-6">
            {mode === 'login' ? 'Access your OmniFlex wallet' : 'Start your journey with OmniFlex'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-teal-200"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <Link
              to={mode === 'login' ? '/register' : '/login'}
              className="text-teal-600 font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
