"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle, Eye, Trash2, RefreshCw } from "lucide-react";
import { uploadToGoogleDrive, deleteFromGoogleDrive } from "@/app/actions/upload";
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
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
      {/* Bagian Atas: Info Variabel */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileData = tugas.uploadedFiles?.[reqIndex];
  const isSudah = !!fileData;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setShowPreview(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("katimName", katimName);
      formData.append("variabelName", tugas.variabel);

      const result = await uploadToGoogleDrive(formData);

      if (result.success && result.webViewLink && result.fileId) {
        const updatedFiles = { ...(tugas.uploadedFiles || {}) };
        updatedFiles[reqIndex] = {
          linkDrive: result.webViewLink,
          fileId: result.fileId
        };

        const newStatus = Object.keys(updatedFiles).length >= totalReqs ? "sudah" : "belum";

        await updateDoc(doc(db, "assignments", tugas.id), {
          uploadedFiles: updatedFiles,
          status: newStatus
        });
        toast.success("Dokumen berhasil diunggah!");
      } else {
        toast.error("Gagal mengunggah: " + result.error);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengunggah.");
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!fileData) return;
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) return;
    
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
          <span className="font-extrabold text-blue-600 mr-2 bg-blue-50 px-2 py-1 rounded-lg">{reqIndex + 1}</span> 
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
                className={`p-2 rounded-xl transition-all shadow-sm ${showPreview ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-200'}`}
                title="Lihat"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isDeleting}
                className="p-2 bg-white border border-gray-200 text-amber-600 hover:bg-amber-50 hover:border-amber-200 rounded-xl transition-all shadow-sm"
                title="Ganti"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
              <button 
                onClick={handleDelete}
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
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
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
    </div>
  );
}
