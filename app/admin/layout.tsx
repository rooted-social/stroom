import { type Metadata } from "next";
import { type ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminAccess } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin | Stroom",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const admin = await requireAdminAccess();

  return <AdminShell adminEmail={admin.email}>{children}</AdminShell>;
}
