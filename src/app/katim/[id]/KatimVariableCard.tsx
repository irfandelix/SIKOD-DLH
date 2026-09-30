"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Upload, Loader2, CheckCircle, Eye, Trash2, RefreshCw } from "lucide-react";
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
  level: string;
  katimId: string;
  status: "belum" | "sudah";
  uploadedFiles?: Record<number, UploadedFile>;
}

export interface Indicator {
  id: string;
  name: string;
  order: number;
  levels: Record<string, string[]>;
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

export default function KatimVariableCard({ katimName, tugas, index, indicator }: KatimVariableCardProps) {
  // Dapatkan array syarat dokumen dari Firestore
  let reqs: string[] = [];
  if (indicator && indicator.levels && indicator.levels[tugas.level]) {
    reqs = indicator.levels[tugas.level];
  }

  const isTanpaDokumen = reqs.length === 1 && reqs[0].toLowerCase().includes("tanpa dokumen");
  
  // Jika "tanpa dokumen", kita anggap langsung 100% selesai, tapi untuk jaga-jaga biarkan admin yang menilai atau Katim klik konfirmasi.
  // Tapi untuk saat ini kita sembunyikan saja tombol upload-nya jika tanpa dokumen.

  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] ">
      {/* Bagian Atas: Info Variabel */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
              Tugas {index}
            </span>
            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {tugas.level}
            </span>
          </div>
          <h3 className="font-extrabold text-white text-lg leading-snug">
            {tugas.variabel}
          </h3>
        </div>
      </div>

      {/* Daftar Point Syarat Dokumen (Masing-masing dengan tombol upload) */}
      <div className="p-6 md:p-8 flex flex-col gap-4 bg-white/50">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Daftar Persyaratan Dokumen
        </h4>
        
        {isTanpaDokumen ? (
          <div className="p-5 bg-green-50 rounded-2xl border border-green-100 text-center text-green-700 italic font-medium shadow-inner">
            {reqs[0]} (Sistem Otomatis Terselesaikan)
          </div>
        ) : (
          reqs.map((req, reqIndex) => (
            <RequirementRow 
              key={reqIndex} 
              reqText={req} 
              reqIndex={reqIndex} 
              tugas={tugas} 
              katimName={katimName} 
              totalReqs={reqs.length}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Komponen Sub-Baris untuk setiap point
function RequirementRow({ reqText, reqIndex, tugas, katimName, totalReqs }: { reqText: string, reqIndex: number, tugas: Tugas, katimName: string, totalReqs: number }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, type: 'delete' | 'replace' | null}>({isOpen: false, type: null});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileData = tugas.uploadedFiles?.[reqIndex];
  const isSudah = !!fileData;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setShowPreview(false);

    try {
      // 1. Minta Resumable Upload URL dari Server
      const sessionResult = await getUploadSessionUrl(katimName, tugas.variabel, file.name, file.type, file.size);
      if (!sessionResult.success || !sessionResult.uploadUrl) {
        throw new Error(sessionResult.error || "Gagal mendapatkan sesi upload");
      }

      // 2. Lempar file LANGSUNG ke Google Drive dari browser (Bypass Vercel limits)
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

      // 3. Beri Akses Publik dan Ambil Link Web View
      const publicResult = await makeFilePublicAndGetLink(fileId);
      if (!publicResult.success || !publicResult.webViewLink) {
        throw new Error(publicResult.error || "Gagal mengatur privasi file");
      }

      // 4. Update Database
      const updatedFiles = { ...(tugas.uploadedFiles || {}) };
      updatedFiles[reqIndex] = {
        linkDrive: publicResult.webViewLink,
        fileId: fileId
      };

      const newStatus = Object.keys(updatedFiles).length >= totalReqs ? "sudah" : "belum";

      await updateDoc(doc(db, "assignments", tugas.id), {
        uploadedFiles: updatedFiles,
        status: newStatus
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
        delete updatedFiles[reqIndex];
        
        await updateDoc(doc(db, "assignments", tugas.id), {
          uploadedFiles: updatedFiles,
          status: "belum" // Jika ada yang dihapus, otomatis statusnya belum selesai semua
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
        <div className="flex-1 text-sm text-gray-700 leading-relaxed">
          <span className="font-extrabold text-orange-600 mr-2 bg-orange-50 px-2 py-1 rounded-lg">{reqIndex + 1}</span> 
          {reqText}
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
