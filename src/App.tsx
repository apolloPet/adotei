
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

// Protected route component
const ProtectedRoute = ({ isAuthenticated, children }: { isAuthenticated: boolean, children: React.ReactNode }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  return isAuthenticated ? <>{children}</> : null;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Check login status from localStorage on mount and when storage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const isAdminUser = localStorage.getItem("isAdmin") === "true";
      
      console.log("Auth state changed:", { isLoggedIn, isAdminUser });
      
      setIsAuthenticated(isLoggedIn);
      setIsAdmin(isAdminUser);
    };
    
    // Initial check
    checkLoginStatus();
    
    // Listen for storage events (both from this window and others)
    window.addEventListener('storage', checkLoginStatus);
    
    // Custom event listener for internal state changes
    window.addEventListener('authStateChanged', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('authStateChanged', checkLoginStatus);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isLoggedIn", "true");
    
    // Notify components about auth state change
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authStateChanged'));
    
    toast.success("Login realizado com sucesso");
  };

  const handleLogout = () => {
    // Clear auth state in localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userEmail");
    
    // Update state
    setIsAuthenticated(false);
    setIsAdmin(false);
    
    // Notify components about auth state change
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authStateChanged'));
    
    toast.success("Logout realizado com sucesso");
    navigate('/');
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setIsAuthenticated(true);
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("isLoggedIn", "true");
    
    // Notify components about auth state change
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authStateChanged'));
    
    toast.success("Login de administrador realizado com sucesso");
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
          
          <Route path="/login" element={<LoginWithProps onLogin={handleLogin} />} />
          
          <Route
            path="/browse"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
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
          
          <Route path="/admin-login" element={<AdminLoginWithProps onLogin={handleAdminLogin} />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
