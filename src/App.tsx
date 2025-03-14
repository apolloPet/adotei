
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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

// Protected route component
const ProtectedRoute = ({ isAuthenticated, children }: { isAuthenticated: boolean, children: React.ReactNode }) => {
  if (!isAuthenticated) {
    // Redirect to login
    window.location.href = '/login';
    return null;
  }
  return <>{children}</>;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setIsAuthenticated(true);
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("isLoggedIn", "true");
  };

  return (
    <div className="app">
      <Header 
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogin={handleLogin}
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
          
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          
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
                <AdminPanel onLogout={handleLogout} />
              </AdminProtectedRoute>
            }
          />
          
          <Route path="/admin-login" element={<AdminLogin onLogin={handleAdminLogin} />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
