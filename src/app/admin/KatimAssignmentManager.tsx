"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

interface Tugas {
  id: string;
  variabel: string;
  level: string;
  katimId: string;
}

interface Katim {
  id: string;
  name: string;
}

interface Indicator {
  id: string;
  name: string;
  order: number;
}

export default function KatimAssignmentManager({ katim, allTugas, indicators }: { katim: Katim, allTugas: Tugas[], indicators: Indicator[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, {checked: boolean, level: string}>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Hitung jumlah yang sudah di-assign
  const existingTugas = allTugas.filter(t => t.katimId === katim.id);
  
  useEffect(() => {
    // Sinkronisasi state lokal dengan data dari Firestore (allTugas)
    const newAssignments: Record<string, {checked: boolean, level: string}> = {};
    indicators.forEach(ind => {
      const v = ind.name;
      const found = existingTugas.find(t => t.variabel === v);
      if (found) {
        newAssignments[v] = { checked: true, level: found.level };
      } else {
        newAssignments[v] = { checked: false, level: "Level 1" };
      }
    });
    setAssignments(newAssignments);
  }, [allTugas, katim.id, indicators]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah accordion tertutup saat menekan tombol simpan
    setIsSaving(true);
    try {
      for (const ind of indicators) {
        const v = ind.name;
        const assignment = assignments[v];
        const existing = existingTugas.find(t => t.variabel === v);

        if (assignment?.checked) {
          if (existing) {
            if (existing.level !== assignment.level) {
              await updateDoc(doc(db, "assignments", existing.id), { level: assignment.level });
            }
          } else {
            await addDoc(collection(db, "assignments"), {
              variabel: v,
              katimId: katim.id,
              level: assignment.level,
              status: "belum",
              uploadedFiles: {}
            });
          }
        } else {
          if (existing) {
            await deleteDoc(doc(db, "assignments", existing.id));
          }
        }
      }
      alert(`Penugasan untuk ${katim.name} berhasil disimpan!`);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan penugasan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden mb-4 shadow-sm transition-all">
      {/* Header Accordion */}
      <div 
        className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="text-gray-400">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{katim.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {existingTugas.length > 0 ? (
                <span className="text-green-600 font-medium">{existingTugas.length} Indikator ditugaskan</span>
              ) : (
                "Belum ada indikator yang ditugaskan"
              )}
            </p>
          </div>
        </div>
        
        {/* Tombol Simpan di Header agar cepat */}
        <div className="mt-4 md:mt-0 md:ml-4">
          <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-medium flex items-center gap-2 disabled:bg-gray-400 w-full md:w-auto justify-center shadow-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Simpan
          </button>
        </div>
      </div>

      {/* Konten (Checklist) */}
      {isOpen && (
        <div className="p-6 bg-white">
          <div className="space-y-3">
            {indicators.map((ind, i) => {
              const v = ind.name;
              const isChecked = assignments[v]?.checked || false;
              const level = assignments[v]?.level || "Level 1";
              
              return (
                <div key={i} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded border transition-colors ${isChecked ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-transparent border-gray-200 hover:bg-gray-50'}`}>
                  <label className="flex items-start gap-3 cursor-pointer flex-1">
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={(e) => {
                        setAssignments(prev => ({
                          ...prev,
                          [v]: { ...prev[v], checked: e.target.checked }
                        }));
                      }}
                      className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer border-gray-300"
                    />
                    <span className={`text-sm font-medium ${isChecked ? 'text-gray-900' : 'text-gray-500'}`}>{v}</span>
                  </label>
                  
                  {isChecked && (
                    <div className="mt-3 md:mt-0 ml-8 md:ml-0 shrink-0">
                      <select 
                        value={level}
                        onChange={(e) => {
                          setAssignments(prev => ({
                            ...prev,
                            [v]: { ...prev[v], level: e.target.value }
                          }));
                        }}
                        className="border-2 border-green-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white text-gray-900 font-bold cursor-pointer"
                      >
                        <option value="Level 1">Level 1</option>
                        <option value="Level 2">Level 2</option>
                        <option value="Level 3">Level 3</option>
                        <option value="Level 4">Level 4</option>
                        <option value="Level 5">Level 5</option>
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
