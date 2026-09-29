"use server";

import { getDriveService } from '@/lib/google-drive';
import { Readable } from 'stream';

export async function uploadToGoogleDrive(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const katimName = formData.get('katimName') as string;
    const variabelName = formData.get('variabelName') as string;

    if (!file) {
      return { success: false, error: "File tidak ditemukan" };
    }

    const drive = getDriveService();
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    // Dapatkan tahun saat ini (misal: "2026")
    const currentYear = new Date().getFullYear().toString();

    // 1. Cek apakah folder tahun ini sudah ada di dalam Root Folder
    let yearFolderId = "";
    const query = `'${rootFolderId}' in parents and name='${currentYear}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    
    const res = await drive.files.list({
      q: query,
      spaces: 'drive',
      fields: 'files(id, name)',
    });

    if (res.data.files && res.data.files.length > 0) {
      // Jika sudah ada, gunakan ID folder tersebut
      yearFolderId = res.data.files[0].id!;
    } else {
      // 2. Jika belum ada, buat folder tahun baru
      const folderMetadata = {
        name: currentYear,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootFolderId!]
      };
      const folderRes = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id'
      });
      yearFolderId = folderRes.data.id!;
    }

    // 3. Cek apakah folder indikator (Variabel) sudah ada di dalam folder tahun tersebut
    let indicatorFolderId = "";
    // Membersihkan nama variabel dari karakter kutip agar tidak error saat query
    const safeVariabelName = variabelName.replace(/['"]/g, '');
    const indicatorQuery = `'${yearFolderId}' in parents and name='${safeVariabelName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    
    const indicatorRes = await drive.files.list({
      q: indicatorQuery,
      spaces: 'drive',
      fields: 'files(id, name)',
    });

    if (indicatorRes.data.files && indicatorRes.data.files.length > 0) {
      indicatorFolderId = indicatorRes.data.files[0].id!;
    } else {
      const indicatorFolderMetadata = {
        name: safeVariabelName, // Nama folder menggunakan nama indikator
        mimeType: 'application/vnd.google-apps.folder',
        parents: [yearFolderId]
      };
      const indicatorFolderRes = await drive.files.create({
        requestBody: indicatorFolderMetadata,
        fields: 'id'
      });
      indicatorFolderId = indicatorFolderRes.data.id!;
    }

    // 4. Cek apakah folder Katim sudah ada di dalam folder indikator tersebut
    let katimFolderId = "";
    const safeKatimName = katimName.replace(/['"]/g, '');
    const katimQuery = `'${indicatorFolderId}' in parents and name='${safeKatimName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    
    const katimRes = await drive.files.list({
      q: katimQuery,
      spaces: 'drive',
      fields: 'files(id, name)',
    });

    if (katimRes.data.files && katimRes.data.files.length > 0) {
      katimFolderId = katimRes.data.files[0].id!;
    } else {
      const katimFolderMetadata = {
        name: safeKatimName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [indicatorFolderId]
      };
      const katimFolderRes = await drive.files.create({
        requestBody: katimFolderMetadata,
        fields: 'id'
      });
      katimFolderId = katimFolderRes.data.id!;
    }

    // 5. Konversi File ke bentuk Stream agar bisa dikirim via Google API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // 6. Nama file dipertahankan sesuai aslinya
    const fileMetadata = {
      name: file.name,
      parents: [katimFolderId] // Masukkan ke dalam folder Katim
    };

    const media = {
      mimeType: file.type,
      body: stream,
    };

    // 7. Unggah file
    const uploadRes = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    return {
      success: true,
      fileId: uploadRes.data.id,
      webViewLink: uploadRes.data.webViewLink
    };

  } catch (error: any) {
    console.error("Error uploadToGoogleDrive:", error);
    return { success: false, error: error.message || "Gagal mengunggah file" };
  }
}


export async function deleteFromGoogleDrive(fileId: string) {
  try {
    const drive = getDriveService();
    await drive.files.delete({ fileId });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return { success: false, error: error.message };
  }
}
