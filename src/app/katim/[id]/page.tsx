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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="font-bold text-gray-800">Ruang Data Dukung</h1>
              <p className="text-xs text-gray-500">{katimName || "Memuat..."}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
          <h2 className="font-semibold text-blue-800 mb-1">Selamat Datang!</h2>
          <p className="text-sm text-blue-600">
            Berikut adalah daftar indikator (variabel) yang menjadi tanggung jawab Anda. 
            Silakan unggah dokumen data dukung yang sesuai dengan level yang diminta.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : tugasList.length === 0 ? (
          <div className="p-8 bg-white border border-gray-200 rounded-xl text-center text-gray-500">
            Belum ada tugas indikator yang dibebankan kepada Anda saat ini.
          </div>
        ) : (
          <div className="space-y-4">
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
