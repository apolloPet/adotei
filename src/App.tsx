
import { Route, Routes } from 'react-router-dom'
import Index from './pages/Index'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import HowItWorks from './pages/HowItWorks'
import Register from './pages/Register'
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

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/register" element={<Register />} />
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
        <Route path="/admin/*" element={
          <AdminProtectedRoute>
            {/* Children do AdminProtectedRoute */}
          </AdminProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <SonnerToaster />
    </>
  )
}

export default App
