import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthExperience } from "@/components/auth/AuthExperience";

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <AuthExperience mode="register">
      <RegisterForm />
    </AuthExperience>
  );
}
