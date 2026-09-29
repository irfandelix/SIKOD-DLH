"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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

interface Katim {
  id: string;
  name: string;
}

export default function KatimProgressAccordion({ katim, tugasKatim }: { katim: Katim, tugasKatim: Tugas[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (tugasKatim.length === 0) return null;

  // Hitung statistik
  const total = tugasKatim.length;
  const sudah = tugasKatim.filter(t => t.status === "sudah").length;
  const progress = Math.round((sudah / total) * 100);

  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden mb-4 shadow-sm transition-all">
      {/* Header Accordion */}
      <div 
        className="bg-gray-50 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="text-gray-400">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{katim.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {total} Indikator tugas
            </p>
          </div>
        </div>
        
        {/* Progress Bar di Header */}
        <div className="flex flex-col items-end">
          <span className={`text-sm font-bold ${progress === 100 ? 'text-green-600' : 'text-blue-600'}`}>
            {progress}% Selesai
          </span>
          <div className="w-32 md:w-48 h-2 bg-gray-200 rounded mt-1 overflow-hidden">
            <div 
              className={`h-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-500`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Konten Progres */}
      {isOpen && (
        <div className="p-6 bg-white">
          <div className="grid grid-cols-1 gap-4">
            {tugasKatim.map(t => (
              <div key={t.id} className={`bg-white border-l-4 rounded p-4 shadow-sm ${t.status === 'sudah' ? 'border-green-500' : 'border-red-400'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${t.status === 'sudah' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.status === 'sudah' ? 'SUDAH INPUT' : 'BELUM INPUT'}
                    </span>
                  </div>
                </div>
                
                <h4 className="font-bold text-gray-800 text-base">{t.variabel}</h4>
                <p className="text-sm text-gray-500">{t.level}</p>

                {/* Daftar file terunggah */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                  {t.uploadedFiles && Object.keys(t.uploadedFiles).length > 0 ? (
                    Object.entries(t.uploadedFiles).map(([idx, file]) => (
                      <div key={idx}>
                        <span className="text-xs text-gray-500 font-medium block mb-1">Tautan Poin {parseInt(idx) + 1}:</span>
                        <div className="flex items-center bg-gray-50 px-3 py-2 rounded border border-gray-200 w-full max-w-xl">
                          <input 
                            type="text" 
                            readOnly 
                            value={file.linkDrive} 
                            className="text-sm text-gray-700 bg-transparent w-full outline-none"
                            onClick={(e) => e.currentTarget.select()}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic mt-2">Menunggu dokumen...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
