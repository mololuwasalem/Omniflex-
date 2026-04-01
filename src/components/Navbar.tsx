import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { Wallet, LogOut, Gift, History, LayoutDashboard, Menu, X, CreditCard } from 'lucide-react';

export const Navbar = () => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Gift Cards', path: '/gift-cards', icon: Gift },
    { name: 'My Cards', path: '/my-gift-cards', icon: CreditCard },
    { name: 'Transactions', path: '/transactions', icon: History },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin', icon: Menu });
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                {/* Swirl effect background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-600 to-teal-400 rounded-full animate-pulse opacity-20"></div>
                <div className="absolute inset-0 border-2 border-teal-500/30 rounded-full border-t-teal-500 border-r-transparent animate-[spin_3s_linear_infinite]"></div>
                
                {/* Gold Card Icon */}
                <div className="relative bg-amber-400 w-7 h-5 rounded-sm shadow-sm flex items-center justify-center overflow-hidden">
                  <div className="absolute top-1 left-1 w-2 h-1 bg-amber-600/30 rounded-full"></div>
                  <CreditCard className="text-white w-4 h-4" />
                  <div className="absolute top-0.5 right-0.5">
                    <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col -space-y-1">
                <div className="text-xl font-extrabold tracking-tighter flex">
                  <span className="text-gray-900">Omni</span>
                  <span className="text-amber-500">Flex</span>
                </div>
                <span className="text-[10px] font-medium text-teal-600 uppercase tracking-widest">by PayBridge</span>
              </div>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {user && navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
                  <Wallet className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-semibold text-teal-700">
                    ₦{profile?.walletBalance.toLocaleString() || '0'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-600 hover:text-teal-600 text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-all shadow-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 overflow-hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user && navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </div>
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  Logout
                </div>
              </button>
            ) : (
              <div className="space-y-1 pt-2 border-t border-gray-100">
                <Link to="/login" className="block px-3 py-2 text-gray-700 font-medium">Login</Link>
                <Link to="/register" className="block px-3 py-2 text-teal-600 font-medium">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
