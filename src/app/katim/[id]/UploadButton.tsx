"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle, Eye, Trash2, RefreshCw } from "lucide-react";
import { uploadToGoogleDrive, deleteFromGoogleDrive } from "@/app/actions/upload";

interface UploadButtonProps {
  katimName: string;
  variabelName: string;
}

export default function UploadButton({ katimName, variabelName }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fileData, setFileData] = useState<{ link: string; id: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileData(null); // Reset while uploading

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("katimName", katimName);
      formData.append("variabelName", variabelName);

      const result = await uploadToGoogleDrive(formData);

      if (result.success && result.webViewLink && result.fileId) {
        setFileData({ link: result.webViewLink, id: result.fileId });
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
      const result = await deleteFromGoogleDrive(fileData.id);
      if (result.success) {
        setFileData(null);
      } else {
        alert("Gagal menghapus file.");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (fileData) {
    return (
      <div className="flex flex-col gap-2 w-full md:w-auto">
        <div className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg justify-center">
          <CheckCircle className="w-4 h-4" />
          Berhasil Diunggah
        </div>
        
        <div className="flex items-center gap-2 justify-center md:justify-end">
          {/* Tombol Lihat Preview */}
          <a 
            href={fileData.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors tooltip"
            title="Lihat Dokumen"
          >
            <Eye className="w-4 h-4" />
          </a>
          
          {/* Tombol Ganti */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
            className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-md transition-colors"
            title="Ganti Dokumen"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
          
          {/* Tombol Hapus */}
          <button 
            onClick={handleDelete}
            disabled={isUploading || isDeleting}
            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
            title="Hapus Dokumen"
          >
             {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Input file disembunyikan (untuk Ganti) */}
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
        />
      </div>
    );
  }

  return (
    <div className="w-full md:w-auto">
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar" 
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full md:w-auto justify-center"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Mengunggah...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Unggah Dokumen
          </>
        )}
      </button>
    </div>
  );
}
