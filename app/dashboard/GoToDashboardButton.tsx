"use client";

import { useRouter } from "next/navigation";

export default function GoToDashboardButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/dashboard"); // Navigate to dashboard
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
    >
      Go to Dashboard
    </button>
  );
}