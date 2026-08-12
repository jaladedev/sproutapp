"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

type Status = "loading" | "authorized" | "unauthorized";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth() ?? {};
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (loading) return;
    if (!user) { setStatus("unauthorized"); return; }
    setStatus(user.is_admin === true ? "authorized" : "unauthorized");
  }, [user, loading]);

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