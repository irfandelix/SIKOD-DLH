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
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
        <h1 className="text-4xl font-extrabold text-green-700 mb-8 tracking-tight">
          SIKOD DLH
        </h1>

        <h2 className="text-lg font-medium text-gray-700 mb-6">
          Silahkan Pilih Nama Anda Untuk Masuk
        </h2>

        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : katims.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-xl text-gray-500 italic">
            Belum ada nama Katim yang didaftarkan oleh Admin.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {katims.map((katim) => (
              <Link
                key={katim.id}
                href={`/katim/${katim.id}`}
                className="p-4 border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left flex items-center justify-between group h-full"
              >
                <span className="font-semibold text-gray-700 group-hover:text-green-700 text-sm leading-snug">
                  {katim.name}
                </span>
                <span className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                  &rarr;
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
