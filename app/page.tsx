import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { signIn } from "next-auth/react";
import { authOptions } from "./api/auth/[...nextauth]/options";

export default async function Page() {
  const session = await getServerSession(authOptions as any);

  if (!session) {
    redirect("/home");
  }
  redirect("/page/project");
}
