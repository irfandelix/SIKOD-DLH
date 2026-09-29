"use client";

import { useState } from "react";
import { Plus, Loader2, Save, X, Trash2, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

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

const DEFAULT_LEVELS = {
  "Level 1": [""],
  "Level 2": [""],
  "Level 3": [""],
  "Level 4": [""],
  "Level 5": [""]
};

export default function IndicatorManager({ indicators }: { indicators: Indicator[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Indicator>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleEdit = (ind: Indicator) => {
    setEditingId(ind.id);
    setFormData(JSON.parse(JSON.stringify(ind))); // Deep copy
    setExpandedId(ind.id);
  };

  const handleAddNew = () => {
    const newId = "new_" + Date.now();
    setEditingId(newId);
    setFormData({
      id: newId,
      name: "",
      order: indicators.length + 1,
      levels: JSON.parse(JSON.stringify(DEFAULT_LEVELS))
    });
    setExpandedId(newId);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleRequirementChange = (level: string, index: number, value: string) => {
    setFormData(prev => {
      const updatedLevels = { ...prev.levels } as any;
      updatedLevels[level][index] = value;
      return { ...prev, levels: updatedLevels };
    });
  };

  const addRequirement = (level: string) => {
    setFormData(prev => {
      const updatedLevels = { ...prev.levels } as any;
      updatedLevels[level].push("");
      return { ...prev, levels: updatedLevels };
    });
  };

  const removeRequirement = (level: string, index: number) => {
    setFormData(prev => {
      const updatedLevels = { ...prev.levels } as any;
      updatedLevels[level].splice(index, 1);
      return { ...prev, levels: updatedLevels };
    });
  };

  const handleSave = async () => {
    if (!formData.name) return alert("Nama indikator harus diisi");
    
    setIsSaving(true);
    try {
      // Bersihkan array kosong sebelum simpan
      const cleanedLevels = { ...formData.levels } as any;
      Object.keys(cleanedLevels).forEach(lvl => {
        cleanedLevels[lvl] = cleanedLevels[lvl].filter((r: string) => r.trim() !== "");
      });

      const dataToSave = {
        name: formData.name,
        order: formData.order,
        levels: cleanedLevels
      };

      if (editingId && editingId.startsWith("new_")) {
        // Create new
        await addDoc(collection(db, "indicators"), dataToSave);
      } else {
        // Update existing
        await updateDoc(doc(db, "indicators", editingId as string), dataToSave);
      }
      
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus indikator ini? Seluruh tugas terkait akan terpengaruh!")) return;
    try {
      await deleteDoc(doc(db, "indicators", id));
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manajemen Indikator & Syarat Data Dukung</h2>
        {!editingId && (
          <button 
            onClick={handleAddNew}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2 transition-colors justify-center"
          >
            <Plus className="w-4 h-4" /> Tambah Indikator
          </button>
        )}
      </div>
      
      <div className="bg-blue-50 text-blue-800 p-4 rounded mb-6 text-sm">
        <strong>Penting:</strong> Mengubah nama indikator atau syarat level di sini akan otomatis ter-update di seluruh aplikasi.
      </div>

      <div className="space-y-4">
        {editingId && editingId.startsWith("new_") && (
          <EditorForm 
            formData={formData as Indicator} 
            setFormData={setFormData}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={handleCancel}
            handleRequirementChange={handleRequirementChange}
            addRequirement={addRequirement}
            removeRequirement={removeRequirement}
          />
        )}

        {indicators.length === 0 && !editingId && (
          <div className="text-center text-gray-500 py-10 border-2 border-dashed border-gray-300 rounded">
            Belum ada indikator.
          </div>
        )}
        
        {indicators.map((ind) => (
          <div key={ind.id} className="border border-gray-200 rounded bg-white overflow-hidden shadow-sm">
            {editingId === ind.id ? (
              <EditorForm 
                formData={formData as Indicator} 
                setFormData={setFormData}
                isSaving={isSaving}
                onSave={handleSave}
                onCancel={handleCancel}
                handleRequirementChange={handleRequirementChange}
                addRequirement={addRequirement}
                removeRequirement={removeRequirement}
              />
            ) : (
              <>
                <div 
                  className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  onClick={() => setExpandedId(expandedId === ind.id ? null : ind.id)}
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-800">{ind.name}</h3>
                    {expandedId === ind.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div className="flex gap-2 mt-3 sm:mt-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(ind); }}
                      className="text-gray-600 hover:text-green-600 font-medium text-sm px-3 py-1 border border-gray-300 rounded bg-white hover:bg-green-50 transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(ind.id); }}
                      className="text-gray-600 hover:text-red-600 font-medium text-sm px-3 py-1 border border-gray-300 rounded bg-white hover:bg-red-50 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {expandedId === ind.id && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                    {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'].map(level => {
                      const reqs = (ind.levels as any)[level] || [];
                      return (
                        <div key={level} className="bg-gray-50 p-3 rounded border border-gray-100">
                          <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2 border-b pb-1">{level}</h4>
                          <ul className="list-disc list-outside ml-4 text-xs text-gray-700 space-y-1">
                            {reqs.map((r: string, i: number) => (
                              <li key={i}>{r}</li>
                            ))}
                            {reqs.length === 0 && <span className="text-gray-400 italic">Tidak ada syarat</span>}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-komponen form edit
function EditorForm({ formData, setFormData, isSaving, onSave, onCancel, handleRequirementChange, addRequirement, removeRequirement }: any) {
  return (
    <div className="p-4 bg-yellow-50/50 border-b-4 border-yellow-400">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">No. Urut</label>
          <input 
            type="number" 
            value={formData.order || ""}
            onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})}
            className="border border-gray-300 rounded px-3 py-2 w-20 text-sm text-gray-900 focus:ring-2 focus:ring-yellow-400 outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 mb-1">Nama Indikator / Variabel</label>
          <input 
            type="text" 
            value={formData.name || ""}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="Contoh: 12. PENGELOLAAN ARSIP"
            className="border border-gray-300 rounded px-3 py-2 w-full text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-yellow-400 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'].map(level => {
          const reqs = formData.levels[level] || [];
          return (
            <div key={level} className="bg-white p-3 rounded border border-gray-200 shadow-sm">
              <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">{level}</h4>
              <div className="space-y-2">
                {reqs.map((r: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <textarea 
                      value={r}
                      onChange={(e) => handleRequirementChange(level, i, e.target.value)}
                      placeholder="Masukkan syarat dokumen..."
                      className="border border-gray-300 rounded px-2 py-1 w-full text-xs text-gray-900 min-h-[60px] focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                    <button 
                      onClick={() => removeRequirement(level, i)}
                      className="text-red-400 hover:text-red-600 mt-1"
                      title="Hapus Syarat"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => addRequirement(level)}
                className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tambah Syarat
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button 
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          Batal
        </button>
        <button 
          onClick={onSave}
          disabled={isSaving}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded font-medium flex items-center gap-2 transition-colors disabled:bg-gray-400"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
