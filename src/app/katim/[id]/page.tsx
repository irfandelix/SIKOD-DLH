"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import KatimVariableCard from "./KatimVariableCard";
import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase/config";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";

interface UploadedFile {
  linkDrive: string;
  fileId: string;
}

interface Tugas {
  id: string;
  variabel: string;
  level: string;
  katimId: string;
  status: "belum" | "sudah";
  uploadedFiles?: Record<number, UploadedFile>;
}

export interface Indicator {
  id: string;
  name: string;
  order: number;
  levels: {
    "Level 1": string[];
    "Level 2": string[];
    "Level 3": string[];
    "Level 4": string[];
    "Level 5": string[];
  };
}

export default function KatimRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [tugasList, setTugasList] = useState<Tugas[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [katimName, setKatimName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil nama asli Katim
    getDoc(doc(db, "katims", id)).then(docSnap => {
      if (docSnap.exists()) {
        setKatimName(docSnap.data().name);
      }
    });

    // Dengarkan perubahan tugas khusus untuk Katim ini secara real-time
    const q = query(collection(db, "assignments"), where("katimId", "==", id));
    const unsubTugas = onSnapshot(q, (snapshot) => {
      const data: Tugas[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Tugas));
      
      // Urutkan berdasarkan nomor variabel
      data.sort((a, b) => {
        const numA = parseInt(a.variabel.split('.')[0]) || 0;
        const numB = parseInt(b.variabel.split('.')[0]) || 0;
        return numA - numB;
      });
      
      setTugasList(data);
      setLoading(false);
    });

    // Ambil indikator dari Firestore
    const unsubIndicators = onSnapshot(collection(db, "indicators"), (snapshot) => {
      const data: Indicator[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Indicator));
      setIndicators(data);
    });

    return () => {
      unsubTugas();
      unsubIndicators();
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans">
      {/* Header Ala Instansi */}
      <header className="bg-green-700 shadow-md border-b-4 border-green-600 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="bg-green-800 hover:bg-green-900 p-2 rounded transition-colors text-white border border-green-600" title="Kembali ke Beranda">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                Ruang Data Dukung
              </h1>
              <p className="text-green-100 text-sm">
                Pengguna: {katimName || "Memuat..."}
              </p>
            </div>
          </div>
          
          {/* Ikon Dekoratif */}
          <div className="hidden sm:flex bg-white p-2 rounded shadow-sm items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <div className="bg-white border-l-4 border-blue-500 rounded shadow-sm p-4 mb-8 flex gap-4 items-start">
          <div className="bg-blue-100 p-2 rounded-full shrink-0 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-1">Informasi Pengunggahan</h2>
            <p className="text-sm text-gray-600">
              Berikut adalah daftar indikator (variabel) yang menjadi tanggung jawab Anda. 
              Silakan unggah dokumen data dukung (berupa file/PDF) yang sesuai dengan level yang diminta. 
              Dokumen akan otomatis tersimpan ke dalam repositori utama.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20 bg-white border border-gray-300 rounded shadow-sm"><Loader2 className="w-8 h-8 animate-spin text-green-700" /></div>
        ) : tugasList.length === 0 ? (
          <div className="p-10 bg-white border border-gray-300 rounded shadow-sm text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            Belum ada tugas indikator yang dibebankan kepada Anda saat ini. Silakan hubungi Administrator jika terjadi kesalahan.
          </div>
        ) : (
          <div className="space-y-6">
            {tugasList.map((tugas, index) => {
              const indicator = indicators.find(ind => ind.name === tugas.variabel);
              
              return (
                <KatimVariableCard 
                  key={tugas.id} 
                  katimName={katimName || id} 
                  tugas={tugas} 
                  index={index + 1}
                  indicator={indicator}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Klasik */}
      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-xs mt-auto">
        <p>&copy; {new Date().getFullYear()} Dinas Lingkungan Hidup. Hak Cipta Dilindungi.</p>
        <p className="mt-1">Sistem Informasi Kinerja &amp; Data Dukung Terpadu</p>
      </footer>
    </div>
  );
}
