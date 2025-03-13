
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import PetDetails from "./pages/PetDetails";
import UserRegistration from "./components/UserRegistration";
import Login from "./components/Login";
import AdminPanel from "./components/AdminPanel";
import PetMatch from "./pages/PetMatch";
import Institution from "./pages/Institution";
import HowItWorks from "./pages/HowItWorks";
import AdminLogin from "./components/AdminLogin";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import PaymentProcess from "./pages/PaymentProcess";

function App() {
  return (
    <ThemeProvider defaultTheme="light" enableSystem>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/pet/:id" element={<PetDetails />} />
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/petmatch" element={<PetMatch />} />
          <Route path="/institution" element={<Institution />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/payment/:matchId" element={<PaymentProcess />} />
          <Route path="/register-tech-partner" element={<Index />} />
          <Route path="/register-vet-partner" element={<Index />} />
          <Route path="/register-ngo-partner" element={<Index />} />
          <Route path="/contact" element={<Index />} />
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminPanel />
            </AdminProtectedRoute>
          } />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
