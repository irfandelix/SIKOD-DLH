"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Eye, ExternalLink } from "lucide-react";

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

interface Indicator {
  id: string;
  name: string;
  order: number;
  levels?: Record<string, string[]>;
}

export default function KatimProgressAccordion({ katim, tugasKatim, indicators }: { katim: Katim, tugasKatim: Tugas[], indicators: Indicator[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (tugasKatim.length === 0) return null;

  const dynamicTugasKatim = tugasKatim.map(t => {
    let isTanpaDokumen = false;
    const ind = indicators?.find(i => i.name === t.variabel);
    if (ind && ind.levels && ind.levels[t.level]) {
      const reqs = ind.levels[t.level];
      isTanpaDokumen = reqs.length === 1 && reqs[0].toLowerCase().includes("tanpa dokumen");
    }
    return {
      ...t,
      status: isTanpaDokumen ? "sudah" as const : t.status,
      isTanpaDokumen
    };
  });

  // Hitung statistik
  const total = dynamicTugasKatim.length;
  const sudah = dynamicTugasKatim.filter(t => t.status === "sudah").length;
  const progress = Math.round((sudah / total) * 100);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4 shadow-sm transition-all">
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
          <span className={`text-sm font-bold ${progress === 100 ? 'text-green-600' : 'text-orange-600'}`}>
            {progress}% Selesai
          </span>
          <div className="w-32 md:w-48 h-2 bg-gray-200 rounded mt-1 overflow-hidden">
            <div 
              className={`h-full ${progress === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-orange-400 to-amber-500'} transition-all duration-500`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Konten Progres */}
      {isOpen && (
        <div className="p-6 bg-white">
          <div className="grid grid-cols-1 gap-4">
            {dynamicTugasKatim.map(t => {
              const isEmptyAndSudah = t.status === 'sudah' && (!t.uploadedFiles || Object.keys(t.uploadedFiles).length === 0);
              
              return (
                <div key={t.id} className={`bg-white/80 backdrop-blur-sm border-l-4 rounded-xl p-4 shadow-sm ${t.status === 'sudah' ? 'border-emerald-500' : 'border-red-400'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${t.status === 'sudah' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {t.status === 'sudah' ? 'SUDAH INPUT' : 'BELUM INPUT'}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-gray-800 text-base">{t.variabel}</h4>
                  

                  {/* Daftar file terunggah */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                    {t.uploadedFiles && Object.keys(t.uploadedFiles).length > 0 ? (
                      Object.entries(t.uploadedFiles).map(([idx, file]) => (
                        <FileRow key={idx} idx={idx} file={file} />
                      ))
                    ) : isEmptyAndSudah ? (
                      <p className="text-sm font-semibold text-emerald-600 italic mt-2">✅ Otomatis selesai (Tanpa Dokumen)</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic mt-2">Menunggu dokumen...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FileRow({ idx, file }: { idx: string, file: UploadedFile }) {
  const [showPreview, setShowPreview] = useState(false);
  const previewLink = file.linkDrive ? file.linkDrive.replace(/\/view\?usp=.*/, '/preview') : '';

  
  let poinDisplay = "Poin -";
  if (idx.includes("_")) {
    const parts = idx.split("_");
    poinDisplay = `${parts[0]} - Poin ${parseInt(parts[1]) + 1}`;
  } else {
    poinDisplay = `Poin ${parseInt(idx) + 1}`;
  }

  return (
    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 w-full flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider whitespace-nowrap">{poinDisplay}</span>

        
        <div className="flex-1 flex items-center bg-white px-3 py-1.5 rounded-lg border border-gray-200 w-full mx-0 sm:mx-4">
          <input 
            type="text" 
            readOnly 
            value={file.linkDrive} 
            className="text-xs text-gray-500 bg-transparent w-full outline-none"
            onClick={(e) => e.currentTarget.select()}
            title="Klik untuk menyalin"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showPreview ? 'bg-orange-600 text-white' : 'bg-white text-orange-600 border border-orange-200 hover:bg-orange-50'}`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          
          <a 
            href={file.linkDrive}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-lg text-xs font-bold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Buka
          </a>
        </div>
      </div>

      {showPreview && previewLink && (
        <div className="mt-1 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-inner">
          <iframe 
            src={previewLink} 
            className="w-full h-[400px]"
            allow="autoplay"
          ></iframe>
        </div>
      )}
    </div>
  );
}
