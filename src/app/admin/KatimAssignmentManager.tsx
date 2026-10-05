"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

interface Tugas {
  id: string;
  variabel: string;
  katimId: string;
  status: string;
}

interface Katim {
  id: string;
  name: string;
}

interface Indicator {
  id: string;
  name: string;
  order: number;
  levels?: Record<string, string[]>;
}

export default function KatimAssignmentManager({ katim, allTugas, indicators }: { katim: Katim, allTugas: Tugas[], indicators: Indicator[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const existingTugas = allTugas.filter(t => t.katimId === katim.id);
  
  useEffect(() => {
    const newAssignments: Record<string, boolean> = {};
    indicators.forEach(ind => {
      const v = ind.name;
      const found = existingTugas.find(t => t.variabel === v);
      newAssignments[v] = !!found;
    });
    setAssignments(newAssignments);
  }, [allTugas, katim.id, indicators]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      for (const ind of indicators) {
        const v = ind.name;
        const isChecked = assignments[v];
        const existing = existingTugas.find(t => t.variabel === v);

        if (isChecked) {
          if (!existing) {
            await addDoc(collection(db, "assignments"), {
              variabel: v,
              katimId: katim.id,
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
      toast.success(`Penugasan untuk ${katim.name} berhasil disimpan!`);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan penugasan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4 shadow-sm transition-all">
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
        
        <div className="mt-4 md:mt-0 md:ml-4">
          <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-5 py-2.5 rounded-xl shadow-md font-medium flex items-center gap-2 disabled:bg-gray-400 w-full md:w-auto justify-center shadow-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Simpan
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-6 bg-white">
          <div className="space-y-3">
            {indicators.map((ind, i) => {
              const v = ind.name;
              const isChecked = assignments[v] || false;
              return (
                <div key={i} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-colors ${isChecked ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-transparent border-gray-200 hover:bg-gray-50'}`}>
                  <label className="flex items-start gap-3 cursor-pointer flex-1">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
                      checked={isChecked}
                      onChange={(e) => {
                        setAssignments(prev => ({
                          ...prev,
                          [v]: e.target.checked
                        }));
                      }}
                    />
                    <div>
                      <span className="font-bold text-gray-900 block">{ind.order}. {v}</span>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
