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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/50 flex flex-col font-sans relative">
      
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-600 border border-gray-200">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-800 tracking-tight">
                Ruang Data Dukung
              </h1>
              <p className="text-gray-500 text-xs font-medium">
                {katimName || "Memuat..."}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 relative z-10">
        <div className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl shadow-lg p-6 mb-8 flex gap-5 items-start">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-2xl shrink-0 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-xl mb-1">Informasi Pengunggahan</h2>
            <p className="text-gray-600 leading-relaxed">
              Berikut adalah daftar indikator (variabel) yang menjadi tanggung jawab Anda. 
              Silakan unggah dokumen data dukung (berupa file/PDF) yang sesuai dengan level yang diminta. 
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20 bg-white/50 backdrop-blur rounded-2xl shadow-sm"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
        ) : tugasList.length === 0 ? (
          <div className="p-12 bg-white/50 backdrop-blur border border-white/60 rounded-3xl shadow-sm text-center text-gray-500 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            </div>
            <p className="text-lg font-medium">Belum ada tugas indikator yang dibebankan kepada Anda.</p>
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
    </div>
  );
}
