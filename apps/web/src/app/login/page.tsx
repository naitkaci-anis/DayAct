import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Connexion — DayAct" };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
