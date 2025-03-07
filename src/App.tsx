import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import PetDetails from "./pages/PetDetails";
import UserRegistration from "./components/UserRegistration";
import Login from "./components/Login";
import AdminPanel from "./components/AdminPanel";

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
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
