
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Index from './pages/Index';
import HowItWorks from './pages/HowItWorks';
import PetDetails from './pages/PetDetails';
import Register from './pages/Register';
import About from './pages/About';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import Browse from './pages/Browse';
import PaymentProcess from './pages/PaymentProcess';
import NotFound from './pages/NotFound';
import PetMatch from './pages/PetMatch';
import Institution from './pages/Institution';
import Contact from './pages/Contact';
import { AdminLoginProps } from './components/AdminLoginProps';
import { AdminPanelProps } from './components/AdminPanelProps';
import { toast } from '@/hooks/use-sonner';
import { AuthProvider, useAuth } from './hooks/use-auth';
import Profile from './pages/Profile';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : null;
};

function AppContent() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Auth state is now managed by the AuthProvider
    // The logout itself is handled in the Header component
    navigate('/');
  };

  // Type casting for components with props
  const LoginWithProps = Login as React.ComponentType<{ onLogin: () => void }>;
  const AdminLoginWithProps = AdminLogin as React.ComponentType<AdminLoginProps>;
  const AdminPanelWithProps = AdminPanel as React.ComponentType<AdminPanelProps>;

  return (
    <div className="app">
      <Header 
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
      <main className="min-h-[calc(100vh-64px)]">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pet/:id" element={<PetDetails />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/payment/:id" element={<PaymentProcess />} />
          <Route path="/petmatch" element={<PetMatch />} />
          <Route path="/institution" element={<Institution />} />
          <Route path="/contact" element={<Contact />} />
          
          <Route path="/login" element={<LoginWithProps onLogin={() => {}} />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/browse"
            element={
              <ProtectedRoute>
                <Browse />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute isAdmin={isAdmin}>
                <AdminPanelWithProps onLogout={handleLogout} />
              </AdminProtectedRoute>
            }
          />
          
          <Route path="/admin-login" element={<AdminLoginWithProps onLogin={() => {}} />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
