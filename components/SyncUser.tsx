"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function SyncUser() {
  const { user } = useUser();
  const upsertUser = useMutation(api.functions.users.upsertUser);

  useEffect(() => {
    if (!user) return;

    upsertUser({
      userId: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      username: user.username ?? undefined,
      name: user.fullName ?? "",
      // color removed — handled server-side now
    });
  }, [user, upsertUser]);

  return null;
}