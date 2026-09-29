import Link from "next/link";
import { LogOut, LayoutDashboard } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-green-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-green-300" />
            <span className="font-bold text-xl tracking-tight">Admin SIKOD DLH</span>
          </div>
          
          <Link 
            href="/" 
            className="flex items-center gap-2 text-green-100 hover:text-white bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Ke Halaman Depan
          </Link>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
