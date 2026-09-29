"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import { Loader2 } from "lucide-react";

interface Katim {
  id: string;
  name: string;
}

export default function Home() {
  const [katims, setKatims] = useState<Katim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "katims"), (snapshot) => {
      const data: Katim[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, name: doc.data().name }));
      setKatims(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans">
      {/* Header Ala Instansi */}
      <header className="bg-green-700 shadow-md border-b-4 border-green-600">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center gap-4">
          <div className="bg-white p-2 rounded shadow-sm flex items-center justify-center">
            {/* Ikon Lightbulb SIKOD */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5"></path>
              <path d="M9 18h6"></path>
              <path d="M10 22h4"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              SIKOD DLH
            </h1>
            <p className="text-green-100 text-sm">
              Sistem Informasi Kinerja &amp; Data Dukung Dinas Lingkungan Hidup
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-4xl bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          {/* Panel Header */}
          <div className="bg-gray-100 border-b border-gray-300 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Pilih Akses Pengguna
            </h2>
          </div>

          {/* Panel Body */}
          <div className="p-6 md:p-8">
            <p className="text-gray-600 mb-6 border-b border-dashed border-gray-300 pb-4">
              Silahkan pilih nama Ketua Tim (Katim) atau penanggung jawab Anda pada daftar di bawah ini untuk mengunggah dokumen persyaratan.
            </p>

            {loading ? (
              <div className="flex justify-center p-10">
                <Loader2 className="w-8 h-8 animate-spin text-green-700" />
              </div>
            ) : katims.length === 0 ? (
              <div className="p-6 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm text-center">
                Belum ada data Pengguna/Katim yang didaftarkan ke dalam sistem. Hubungi Administrator.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {katims.map((katim) => (
                  <Link
                    key={katim.id}
                    href={`/katim/${katim.id}`}
                    className="flex items-center justify-between p-3 border border-gray-300 rounded bg-white hover:bg-green-50 hover:border-green-600 transition-colors group"
                  >
                    <span className="font-bold text-gray-700 group-hover:text-green-800 text-sm">
                      {katim.name}
                    </span>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded group-hover:bg-green-600 group-hover:text-white transition-colors">
                      Masuk &raquo;
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Admin Link at the bottom of panel */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-right">
            <Link href="/admin" className="text-xs text-gray-500 hover:text-green-700 hover:underline inline-flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Login Admin
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Klasik */}
      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} Dinas Lingkungan Hidup. Hak Cipta Dilindungi.</p>
        <p className="mt-1">Sistem Informasi Kinerja &amp; Data Dukung Terpadu</p>
      </footer>
    </div>
  );
}
