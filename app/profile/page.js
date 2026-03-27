// app/profile.js

import { auth } from "../../lib/auth"; // <-- Import auth function
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session.user.email}</p>
    </div>
  );
}