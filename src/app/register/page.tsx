import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Kayıt Ol | Pişti",
  description: "Pişti hesabınızı oluşturun.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
