import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";
import AuthGuard from "@/components/layout/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#F5F5F5] overflow-hidden">
        {/* Sidebar - Desktop */}
        <Sidebar className="hidden md:flex" />

      <div className="flex flex-col flex-1 overflow-hidden relative pb-16 md:pb-0">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation (Hidden on Desktop) */}
        <MobileNav />
      </div>
      </div>
    </AuthGuard>
  );
}
