import AppLayout from "@/components/layout/app-layout";
import CreatePaymentForm from "@/components/payments/create-payment-form";

const CreatePaymentPage: React.FC = () => {
  return (
    <AppLayout requireAuth>
      <div className="container py-8 max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          Create Payment
        </h1>
        <CreatePaymentForm />
      </div>
    </AppLayout>
  );
};

export default CreatePaymentPage;
