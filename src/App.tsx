import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { GiftCards } from './pages/GiftCards';
import { MyGiftCards } from './pages/MyGiftCards';
import { Transactions } from './pages/Transactions';
import { Admin } from './pages/Admin';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
          <Navbar />
          <main className="pb-20">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/gift-cards" element={
                <ProtectedRoute>
                  <GiftCards />
                </ProtectedRoute>
              } />

              <Route path="/my-gift-cards" element={
                <ProtectedRoute>
                  <MyGiftCards />
                </ProtectedRoute>
              } />
              
              <Route path="/transactions" element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
