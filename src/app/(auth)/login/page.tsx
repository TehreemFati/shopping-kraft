import { LoginForm } from "@/components/auth/LoginForm";
import { AuthExperience } from "@/components/auth/AuthExperience";

export const metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthExperience mode="login">
      <LoginForm redirect={params.redirect} />
    </AuthExperience>
  );
}
