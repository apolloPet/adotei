
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { useAuth } from "@/hooks/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ResetPassword = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ForgotPasswordForm />
    </div>
  );
};

export default ResetPassword;
