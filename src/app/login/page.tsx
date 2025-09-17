import { LoginCard } from '@/components/auth/LoginCard';
import { PageLayout } from '@/components/layout/PageLayout';

const LoginPage = () => {
  return (
    <PageLayout
      background="gradient"
      className="flex items-center justify-center"
    >
      <LoginCard />
    </PageLayout>
  );
};

export default LoginPage;
