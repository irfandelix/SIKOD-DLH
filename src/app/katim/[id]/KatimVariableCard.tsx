"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Upload, Loader2, CheckCircle, Eye, Trash2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { getUploadSessionUrl, makeFilePublicAndGetLink, deleteFromGoogleDrive } from "@/app/actions/upload";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

interface UploadedFile {
  linkDrive: string;
  fileId: string;
}

interface Tugas {
  id: string;
  variabel: string;
  level: string; // Deprecated, but keeping for compatibility
  katimId: string;
  status: "belum" | "sudah";
  uploadedFiles?: Record<string, UploadedFile>;
}

export interface Indicator {
  id: string;
  name: string;
  order: number;
  levels: Record<string, string[]>;
  descriptions?: Record<string, string>;
}

interface KatimVariableCardProps {
  katimName: string;
  tugas: Tugas;
  index: number;
  indicator?: Indicator;
}

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isDestructive = false }: any) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${isDestructive ? "bg-rose-600 hover:bg-rose-700" : "bg-orange-600 hover:bg-orange-700"}`}
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Komponen Sub-Baris untuk setiap point (sekarang menerima fileKey string)
function RequirementRow({ reqText, fileKey, tugas, katimName, totalReqs, level }: { reqText: string, fileKey: string, tugas: Tugas, katimName: string, totalReqs: number, level: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, type: 'delete' | 'replace' | null}>({isOpen: false, type: null});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileData = tugas.uploadedFiles?.[fileKey];
  const isSudah = !!fileData;

  const reqIndexNum = parseInt(fileKey.split('_')[1]) || 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setShowPreview(false);

    try {
      const sessionResult = await getUploadSessionUrl(katimName, tugas.variabel, file.name, file.type, file.size);
      if (!sessionResult.success || !sessionResult.uploadUrl) {
        throw new Error(sessionResult.error || "Gagal mendapatkan sesi upload");
      }

      const putResponse = await fetch(sessionResult.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file
      });

      if (!putResponse.ok) {
        throw new Error("Gagal mengunggah file langsung ke Google Drive");
      }

      const putData = await putResponse.json();
      const fileId = putData.id;

      if (!fileId) throw new Error("ID File tidak ditemukan dari Google Drive");

      const publicResult = await makeFilePublicAndGetLink(fileId);
      if (!publicResult.success || !publicResult.webViewLink) {
        throw new Error(publicResult.error || "Gagal mengatur privasi file");
      }

      const updatedFiles = { ...(tugas.uploadedFiles || {}) };
      updatedFiles[fileKey] = {
        linkDrive: publicResult.webViewLink,
        fileId: fileId
      };

      // Untuk accordion multi-level, status 'sudah' mungkin sulit ditentukan secara global.
      // Kita asumsikan tetap 'belum' sampai diverifikasi, atau kita bisa hilangkan auto-status.
      await updateDoc(doc(db, "assignments", tugas.id), {
        uploadedFiles: updatedFiles,
        status: "belum"
      });
      toast.success("Dokumen berhasil diunggah!");
      
    } catch (error: any) {
      toast.error("Terjadi kesalahan: " + error.message);
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const executeDelete = async () => {
    if (!fileData) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteFromGoogleDrive(fileData.fileId);
      if (result.success || result.error?.includes("File not found")) {
        const updatedFiles = { ...(tugas.uploadedFiles || {}) };
        delete updatedFiles[fileKey];
        
        await updateDoc(doc(db, "assignments", tugas.id), {
          uploadedFiles: updatedFiles,
          status: "belum"
        });
        setShowPreview(false);
        toast.success("Dokumen berhasil dihapus!");
      } else {
        toast.error("Gagal menghapus file: " + result.error);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus.");
    } finally {
      setIsDeleting(false);
    }
  };

  const previewLink = fileData?.linkDrive ? fileData.linkDrive.replace(/\/view\?usp=.*/, '/preview') : '';

  return (
    <div className="flex flex-col gap-4 p-5 bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl transition-all hover:shadow-md hover:bg-white/80">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
          <span className="shrink-0 font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg shadow-sm">{reqIndexNum + 1}</span> 
          <span className="pt-0.5">{reqText.replace(/^\d+\.\s*/, '')}</span>
        </div>
        
        <div className="shrink-0 flex items-center gap-2 justify-end">
          {isSudah ? (
            <>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-xl shadow-sm border border-emerald-200/50">
                <CheckCircle className="w-3.5 h-3.5" /> Terunggah
              </div>
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className={`p-2 rounded-xl transition-all shadow-sm ${showPreview ? 'bg-orange-600 text-white shadow-orange-500/30' : 'bg-white text-orange-600 hover:bg-orange-50 border border-gray-200'}`}
                title="Lihat"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setConfirmState({isOpen: true, type: 'replace'})}
                disabled={isUploading || isDeleting}
                className="p-2 bg-white border border-gray-200 text-amber-600 hover:bg-amber-50 hover:border-amber-200 rounded-xl transition-all shadow-sm"
                title="Ganti"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setConfirmState({isOpen: true, type: 'delete'})}
                disabled={isUploading || isDeleting}
                className="p-2 bg-white border border-gray-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-all shadow-sm"
                title="Hapus"
              >
                 {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 transition-all hover:shadow-lg "
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Unggah Dokumen
            </button>
          )}

          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
          />
        </div>
      </div>

      {showPreview && fileData && (
        <div className="mt-2 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-inner">
            <iframe 
              src={previewLink} 
              className="w-full h-[500px]"
              allow="autoplay"
            ></iframe>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmState.isOpen}
        title={confirmState.type === 'delete' ? "Hapus Dokumen?" : "Ganti Dokumen?"}
        message={confirmState.type === 'delete' ? "Apakah Anda yakin ingin menghapus dokumen ini secara permanen?" : "Dokumen lama akan tertimpa dan tidak bisa dikembalikan. Yakin ingin menggantinya?"}
        isDestructive={confirmState.type === 'delete'}
        onCancel={() => setConfirmState({isOpen: false, type: null})}
        onConfirm={() => {
          setConfirmState({isOpen: false, type: null});
          if (confirmState.type === 'delete') {
            executeDelete();
          } else if (confirmState.type === 'replace') {
            fileInputRef.current?.click();
          }
        }}
      />
    </div>
  );
}

export default function KatimVariableCard({ katimName, tugas, index, indicator }: KatimVariableCardProps) {
  const [expandedLevel, setExpandedLevel] = useState<string | null>("Level 1");

  const levelKeys = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"];
  const levelNames = ["Tingkat I", "Tingkat II", "Tingkat III", "Tingkat IV", "Tingkat V"];

  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] ">
      {/* Bagian Atas: Info Variabel */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
              Tugas {index}
            </span>
          </div>
          <h3 className="font-extrabold text-white text-lg leading-snug">
            {tugas.variabel}
          </h3>
        </div>
      </div>

      <div className="p-4 md:p-6 bg-gray-50 flex flex-col gap-4">
        {levelKeys.map((lvl, idx) => {
          const reqs = indicator?.levels?.[lvl] || [];
          if (reqs.length === 0 || (reqs.length === 1 && reqs[0] === "")) return null;
          
          const isExpanded = expandedLevel === lvl;
          const isTanpaDokumen = reqs.length === 1 && reqs[0].toLowerCase().includes("tanpa dokumen");

          return (
            <div key={lvl} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Accordion Header */}
              <div 
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedLevel(isExpanded ? null : lvl)}
              >
                <div>
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                      {levelNames[idx]}
                    </span>
                  </h4>
                  {indicator?.descriptions?.[lvl] && (
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed pr-8">
                      {indicator.descriptions[lvl]}
                    </p>
                  )}
                </div>
                <div className="text-gray-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    Daftar Persyaratan Dokumen
                  </h4>

                  {isTanpaDokumen ? (
                     <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-emerald-900">Tanpa Dokumen Persyaratan</h4>
                            <p className="text-sm text-emerald-700 mt-0.5">Level ini tidak membutuhkan bukti fisik dokumen.</p>
                          </div>
                        </div>
                     </div>
                  ) : (
                    reqs.map((req, reqIndex) => {
                      // Compatibility for old assignments (if key was just number string)
                      const fileKey = `${lvl}_${reqIndex}`;
                      return (
                        <RequirementRow 
                          key={fileKey} 
                          reqText={req} 
                          fileKey={fileKey}
                          level={lvl}
                          tugas={tugas} 
                          katimName={katimName} 
                          totalReqs={reqs.length} 
                        />
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
