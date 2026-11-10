"use client";

import { useRouter } from "next/navigation";
import App from "../../App";

export default function SignUpPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push("/chat");
  };

  return <App onComplete={handleComplete} />;
}

