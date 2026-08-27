"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "./auth";

export async function signOutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
