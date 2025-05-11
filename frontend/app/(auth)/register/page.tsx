import RegisterForm from "@/components/auth/register-form";
import AuthLayout from "@/components/layout/auth-layout";

const RegisterPage: React.FC = () => {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;
