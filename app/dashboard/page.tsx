import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-3xl font-bold">
        Welcome, {session?.user?.name || "User"} 🎉
      </h1>
      <p className="text-gray-600">Signed in as {session?.user?.email}</p>
      <LogoutButton />
    </div>
  );
}