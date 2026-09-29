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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex flex-col font-sans relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 "></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30  animation-delay-2000"></div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 relative z-10">
        <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 md:p-12 text-center transition-all">
          
          <div className="inline-flex items-center justify-center p-4 bg-green-500 rounded-2xl shadow-lg shadow-green-500/30 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5"></path>
              <path d="M9 18h6"></path>
              <path d="M10 22h4"></path>
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-orange-700 tracking-tight mb-4">
            SIKOD DLH
          </h1>
          <p className="text-gray-500 font-medium mb-10 max-w-lg mx-auto">
            Sistem Informasi Kinerja &amp; Data Dukung Terpadu. Silakan pilih akses profil pengguna Anda untuk memulai.
          </p>

          <div className="bg-white/60 rounded-2xl p-6 md:p-8 shadow-inner border border-gray-100/50">
            {loading ? (
              <div className="flex justify-center p-10">
                <Loader2 className="w-10 h-10 animate-spin text-green-500" />
              </div>
            ) : katims.length === 0 ? (
              <div className="p-8 bg-yellow-50/50 rounded-xl text-yellow-700 text-sm border border-yellow-100 backdrop-blur-sm">
                Belum ada profil pengguna yang terdaftar.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
                {katims.map((katim) => (
                  <Link
                    key={katim.id}
                    href={`/katim/${katim.id}`}
                    className="group relative p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    <div className="flex items-center justify-between z-10 relative">
                      <span className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                        {katim.name}
                      </span>
                      <span className="bg-green-100 text-green-600 rounded-full p-1 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
