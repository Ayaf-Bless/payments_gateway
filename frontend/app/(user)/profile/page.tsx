import AppLayout from "@/components/layout/app-layout";
import ProfileForm from "@/components/user/profile-form";

const ProfilePage: React.FC = () => {
  return (
    <AppLayout requireAuth>
      <div className="container py-8 max-w-4xl animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Your Profile</h1>
        <ProfileForm />
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
