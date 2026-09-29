import Link from "next/link";
import { LogOut, LayoutDashboard } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/50 flex flex-col font-sans relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-gradient-to-br from-green-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 tracking-tight">
                Dashboard Administrator
              </h1>
              <p className="text-gray-500 text-xs font-medium">
                SIKOD Dinas Lingkungan Hidup
              </p>
            </div>
          </div>
          
          <Link 
            href="/" 
            className="flex items-center gap-2 text-red-600 hover:text-white bg-red-50 hover:bg-red-500 border border-red-100 hover:border-red-500 px-4 py-2 rounded-xl transition-all text-sm font-semibold shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 relative z-10">
        {children}
      </main>
    </div>
  );
}
