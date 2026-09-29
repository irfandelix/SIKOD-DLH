import Link from "next/link";
import { LogOut, LayoutDashboard } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans">
      {/* Header Ala Instansi */}
      <header className="bg-green-700 shadow-md border-b-4 border-green-600 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-white p-2 rounded shadow-sm items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                Dashboard Admin
              </h1>
              <p className="text-green-100 text-sm">
                SIKOD Dinas Lingkungan Hidup
              </p>
            </div>
          </div>
          
          <Link 
            href="/" 
            className="flex items-center gap-2 text-white hover:text-white bg-green-800 hover:bg-green-900 border border-green-600 px-4 py-2 rounded transition-colors text-sm font-medium shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Tutup Halaman</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {children}
      </main>

      {/* Footer Klasik */}
      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-xs mt-auto">
        <p>&copy; {new Date().getFullYear()} Dinas Lingkungan Hidup. Hak Cipta Dilindungi.</p>
        <p className="mt-1">Sistem Informasi Kinerja &amp; Data Dukung Terpadu</p>
      </footer>
    </div>
  );
}
