import LoginForm from "@/components/auth/login-form";
import AuthLayout from "@/components/layout/auth-layout";

const LoginPage: React.FC = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
