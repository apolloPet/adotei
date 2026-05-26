
import { Route, Routes } from 'react-router-dom'
import Index from './pages/Index'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import HowItWorks from './pages/HowItWorks'
import Register from './pages/Register'
import Login from './pages/Login'
import Browse from './pages/Browse'
import PetDetails from './pages/PetDetails'
import './App.css'
import Header from './components/header'
import PetMatch from './pages/PetMatch'
import Profile from './pages/Profile'
import { Toaster } from "@/components/ui/toaster"
import ResetPassword from './pages/ResetPassword'
import ResetPasswordConfirm from './pages/ResetPasswordConfirm'
import Institution from './pages/Institution'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import EmailConfirmation from './pages/EmailConfirmation'
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import PaymentProcess from './pages/PaymentProcess'
import SecuritySettings from './pages/SecuritySettings'
import PaymentHistory from './pages/PaymentHistory'
import Suppliers from './pages/Suppliers'
import AdminPanel from './components/AdminPanel'
import AdminLogin from './components/AdminLogin'
import OnboardingTour from './components/onboarding/OnboardingTour'
import { signOut } from '@/services/auth'
import { toast } from './hooks/use-sonner'
import { useNavigate } from 'react-router-dom'

function App() {
  // Add a function for handling logout
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso");
      // No need for navigate here since the AdminPanel component
      // will have its own navigation logic
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/pets/:id" element={<PetDetails />} />
        <Route path="/match" element={<PetMatch />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
        <Route path="/institution" element={<Institution />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />
        <Route path="/payment/:id" element={<PaymentProcess />} />
        
        {/* Novas rotas para as funcionalidades implementadas */}
        <Route path="/security" element={<SecuritySettings />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/suppliers" element={<Suppliers />} />
        
        {/* Rotas Admin */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminPanel onLogout={handleLogout} />
          </AdminProtectedRoute>
        } />
        <Route path="/admin-login" element={<AdminLogin />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <SonnerToaster />
      <OnboardingTour />
    </>
  )
}

export default App
