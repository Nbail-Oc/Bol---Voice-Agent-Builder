"use client";

import { useRouter } from "next/navigation";
import App from "../../App";

export default function AuthPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push("/chat");
  };

  return <App onComplete={handleComplete} />;
}

