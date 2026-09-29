"use client";

import { useState, useEffect } from "react";
import { Users, FileText, CheckCircle, XCircle, ExternalLink, Plus, Loader2, Settings } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import KatimAssignmentManager from "./KatimAssignmentManager";
import KatimProgressAccordion from "./KatimProgressAccordion";
import IndicatorManager from "./IndicatorManager";

interface Katim {
  id: string;
  name: string;
}

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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"katim" | "tugas" | "pantau" | "indikator">("tugas");

  const [katims, setKatims] = useState<Katim[]>([]);
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newKatimName, setNewKatimName] = useState("");

  useEffect(() => {
    // Subscribe to Katims
    const unsubKatims = onSnapshot(collection(db, "katims"), (snapshot) => {
      const katimData: Katim[] = [];
      snapshot.forEach((doc) => katimData.push({ id: doc.id, ...doc.data() } as Katim));
      // Urutkan berdasarkan nama
      katimData.sort((a, b) => a.name.localeCompare(b.name));
      setKatims(katimData);
    });

    // Subscribe to Tugas (Assignments)
    const unsubTugas = onSnapshot(collection(db, "assignments"), (snapshot) => {
      const tugasData: Tugas[] = [];
      snapshot.forEach((doc) => tugasData.push({ id: doc.id, ...doc.data() } as Tugas));
      setTugas(tugasData);
    });
    
    // Subscribe to Indicators
    const unsubIndicators = onSnapshot(collection(db, "indicators"), (snapshot) => {
      const indData: Indicator[] = [];
      snapshot.forEach((doc) => indData.push({ id: doc.id, ...doc.data() } as Indicator));
      // Urutkan berdasarkan order (1, 2, 3...)
      indData.sort((a, b) => (a.order || 0) - (b.order || 0));
      setIndicators(indData);
      setIsLoading(false);
    });

    return () => {
      unsubKatims();
      unsubTugas();
      unsubIndicators();
    };
  }, []);

  const handleAddKatim = async () => {
    if (!newKatimName.trim()) return;
    const slugId = newKatimName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    try {
      await setDoc(doc(db, "katims", slugId), { name: newKatimName });
      setNewKatimName("");
    } catch (error) {
      alert("Gagal menambah Katim");
    }
  };

  const handleDeleteKatim = async (id: string) => {
    if (!confirm("Hapus Katim ini?")) return;
    try {
      await deleteDoc(doc(db, "katims", id));
    } catch (error) {
      alert("Gagal menghapus Katim");
    }
  };

  return (
    <div className="w-full">
      <div className="w-full">
        
        {/* Chrome-like Tabs */}
        <div className="flex gap-1 flex-wrap border-b border-gray-300">
          <button 
            onClick={() => setActiveTab("katim")}
            className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 rounded-t-lg border-t border-x transition-all ${
              activeTab === "katim" 
                ? "bg-white text-green-700 border-gray-300 border-b-white relative top-[1px] shadow-[0_-2px_4px_rgba(0,0,0,0.02)] z-10" 
                : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200 border-b-gray-300"
            }`}
          >
            <Users className="w-4 h-4" /> Kelola Katim
          </button>
          
          <button 
            onClick={() => setActiveTab("tugas")}
            className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 rounded-t-lg border-t border-x transition-all ${
              activeTab === "tugas" 
                ? "bg-white text-green-700 border-gray-300 border-b-white relative top-[1px] shadow-[0_-2px_4px_rgba(0,0,0,0.02)] z-10" 
                : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200 border-b-gray-300"
            }`}
          >
            <FileText className="w-4 h-4" /> Bagi Tugas
          </button>
          
          <button 
            onClick={() => setActiveTab("pantau")}
            className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 rounded-t-lg border-t border-x transition-all ${
              activeTab === "pantau" 
                ? "bg-white text-green-700 border-gray-300 border-b-white relative top-[1px] shadow-[0_-2px_4px_rgba(0,0,0,0.02)] z-10" 
                : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200 border-b-gray-300"
            }`}
          >
            <CheckCircle className="w-4 h-4" /> Pantau Progres
          </button>
          
          <button 
            onClick={() => setActiveTab("indikator")}
            className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 rounded-t-lg border-t border-x transition-all ${
              activeTab === "indikator" 
                ? "bg-white text-green-700 border-gray-300 border-b-white relative top-[1px] shadow-[0_-2px_4px_rgba(0,0,0,0.02)] z-10" 
                : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200 border-b-gray-300"
            }`}
          >
            <Settings className="w-4 h-4" /> Kelola Indikator
          </button>
        </div>

        {/* Main Content Area */}
        <main className="bg-white border border-gray-300 rounded-b-xl rounded-tr-xl shadow-sm p-6 md:p-8 relative z-0 min-h-[60vh]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            {/* TAB 1: KELOLA KATIM */}
            {activeTab === "katim" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Daftar Ketua Tim (Katim)</h2>
                
                <div className="bg-white p-6 rounded border border-gray-200 shadow-sm mb-8">
                  <h3 className="font-bold text-gray-700 mb-3">Tambah Katim Baru</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newKatimName}
                      onChange={(e) => setNewKatimName(e.target.value)}
                      placeholder="Masukkan nama Katim baru..." 
                      className="flex-1 border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900 bg-white" 
                    />
                    <button onClick={handleAddKatim} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Tambah
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {katims.length === 0 && <p className="text-gray-500 italic">Belum ada data Katim.</p>}
                  {katims.map(k => (
                    <div key={k.id} className="bg-white border border-gray-200 rounded p-4 flex justify-between items-center shadow-sm">
                      <span className="font-semibold text-gray-700">{k.name}</span>
                      <button onClick={() => handleDeleteKatim(k.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors" title="Hapus">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: PEMBAGIAN DAYA DUKUNG */}
            {activeTab === "tugas" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Kelola Penugasan Katim</h2>
                
                {katims.length === 0 ? (
                  <div className="p-8 bg-gray-50 rounded text-center text-gray-500 italic">
                    Belum ada Katim yang didaftarkan. Silakan tambahkan Katim di Tab 1 terlebih dahulu.
                  </div>
                ) : (
                  <div>
                    {katims.map(k => (
                      <KatimAssignmentManager key={k.id} katim={k} allTugas={tugas} indicators={indicators} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PANTAU PROGRES */}
            {activeTab === "pantau" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Pantau Progres Data Dukung</h2>
                
                {katims.map(katim => {
                  const tugasKatim = tugas
                    .filter(t => t.katimId === katim.id)
                    .sort((a, b) => {
                       const numA = parseInt(a.variabel.split('.')[0]) || 0;
                       const numB = parseInt(b.variabel.split('.')[0]) || 0;
                       return numA - numB;
                    });
                  
                  return <KatimProgressAccordion key={katim.id} katim={katim} tugasKatim={tugasKatim} />;
                })}

                {tugas.length === 0 && (
                  <div className="p-8 bg-white rounded text-center text-gray-500 border border-gray-200">
                    Belum ada penugasan daya dukung kepada satupun Katim.
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: KELOLA INDIKATOR (CMS) */}
            {activeTab === "indikator" && (
              <IndicatorManager indicators={indicators} />
            )}
          </>
        )}
        </main>
      </div>
    </div>
  );
}
