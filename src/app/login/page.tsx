import { PageLayout } from "@/components/layout/PageLayout";
import { LoginCard } from "@/components/auth/LoginCard";

export default function LoginPage() {
  return (
    <PageLayout background="gradient" className="flex items-center justify-center">
      <LoginCard />
    </PageLayout>
  );
}
