"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

type Status = "loading" | "authorized" | "unauthorized";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth() ?? {};

  const status: Status = loading
    ? "loading"
    : !user
      ? "unauthorized"
      : user.is_admin === true ? "authorized" : "unauthorized";

  useEffect(() => {
    if (status === "unauthorized") router.replace("/dashboard");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0D1F1A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status !== "authorized") return null;
  return children;
}