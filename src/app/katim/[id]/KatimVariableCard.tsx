"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle, Eye, Trash2, RefreshCw } from "lucide-react";
import { uploadToGoogleDrive, deleteFromGoogleDrive } from "@/app/actions/upload";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

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
    <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden flex flex-col">
      {/* Bagian Atas: Info Variabel */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-green-700 text-white text-xs font-bold px-2 py-0.5 rounded">
              #{index}
            </span>
            <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-bold px-2 py-0.5 rounded">
              {tugas.level}
            </span>
          </div>
          <h3 className="font-bold text-gray-800 text-base leading-snug">
            {tugas.variabel}
          </h3>
        </div>
      </div>

      {/* Daftar Point Syarat Dokumen (Masing-masing dengan tombol upload) */}
      <div className="p-6 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-200 pb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Daftar Persyaratan Dokumen
        </h4>
        
        {isTanpaDokumen ? (
          <div className="p-4 bg-gray-50 rounded border border-gray-200 text-center text-gray-500 italic text-sm">
            {reqs[0]} (Tidak perlu unggah dokumen)
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
      } else {
        alert("Gagal mengunggah: " + result.error);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat mengunggah.");
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
      } else {
        alert("Gagal menghapus file: " + result.error);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus.");
    } finally {
      setIsDeleting(false);
    }
  };

  const previewLink = fileData?.linkDrive ? fileData.linkDrive.replace(/\/view\?usp=.*/, '/preview') : '';

  return (
    <div className="flex flex-col gap-3 p-4 bg-blue-50/30 border border-blue-100 rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 text-sm text-gray-700">
          <span className="font-bold mr-2">{reqIndex + 1}.</span> 
          {reqText}
        </div>
        
        <div className="shrink-0 flex items-center gap-2 justify-end">
          {isSudah ? (
            <>
              <div className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                <CheckCircle className="w-3 h-3" /> Diunggah
              </div>
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className={`p-2 rounded-md transition-colors ${showPreview ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                title="Lihat"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isDeleting}
                className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-md transition-colors"
                title="Ganti"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
              <button 
                onClick={handleDelete}
                disabled={isUploading || isDeleting}
                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                title="Hapus"
              >
                 {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Unggah
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
        <div className="mt-2 pt-2 border-t border-blue-100/50">
          <iframe 
            src={previewLink} 
            className="w-full h-[400px] bg-white rounded-lg border border-gray-200"
            allow="autoplay"
          ></iframe>
        </div>
      )}
    </div>
  );
}
