import { StoreProvider } from "@/lib/store";
import { UIShell } from "@/components/dashboard/UIShell";

export const metadata = {
  title: "DayAct — Tableau de bord",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <StoreProvider>
      <UIShell>{children}</UIShell>
    </StoreProvider>
  );
}
