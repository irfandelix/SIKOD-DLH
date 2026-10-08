"use server";

import { google } from "googleapis";
import { Readable } from "stream";
import { headers } from "next/headers";

function getAuthClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
}

function getDriveService() {
  const auth = getAuthClient();
  return google.drive({ version: 'v3', auth });
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

export async function getUploadSessionUrl(katimName: string, variabelName: string, levelName: string, reqNumber: number, fileName: string, mimeType: string, fileSize: number) {
  try {
    const drive = getDriveService();
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    const currentYear = new Date().getFullYear().toString();
    let yearFolderId = "";
    const query = `'${rootFolderId}' in parents and name='${currentYear}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const res = await drive.files.list({ q: query, spaces: 'drive', fields: 'files(id, name)' });
    if (res.data.files && res.data.files.length > 0) {
      yearFolderId = res.data.files[0].id!;
    } else {
      const folderRes = await drive.files.create({
        requestBody: { name: currentYear, mimeType: 'application/vnd.google-apps.folder', parents: [rootFolderId!] },
        fields: 'id'
      });
      yearFolderId = folderRes.data.id!;
    }

    let indicatorFolderId = "";
    const safeVariabelName = variabelName.replace(/['"]/g, '');
    const indicatorQuery = `'${yearFolderId}' in parents and name='${safeVariabelName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const indicatorRes = await drive.files.list({ q: indicatorQuery, spaces: 'drive', fields: 'files(id, name)' });
    if (indicatorRes.data.files && indicatorRes.data.files.length > 0) {
      indicatorFolderId = indicatorRes.data.files[0].id!;
    } else {
      const indicatorFolderRes = await drive.files.create({
        requestBody: { name: safeVariabelName, mimeType: 'application/vnd.google-apps.folder', parents: [yearFolderId] },
        fields: 'id'
      });
      indicatorFolderId = indicatorFolderRes.data.id!;
    }

    let levelFolderId = "";
    const safeLevelName = levelName.replace(/['"]/g, '');
    const levelQuery = `'${indicatorFolderId}' in parents and name='${safeLevelName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const levelRes = await drive.files.list({ q: levelQuery, spaces: 'drive', fields: 'files(id, name)' });
    if (levelRes.data.files && levelRes.data.files.length > 0) {
      levelFolderId = levelRes.data.files[0].id!;
    } else {
      const levelFolderRes = await drive.files.create({
        requestBody: { name: safeLevelName, mimeType: 'application/vnd.google-apps.folder', parents: [indicatorFolderId] },
        fields: 'id'
      });
      levelFolderId = levelFolderRes.data.id!;
    }

    let syaratFolderId = "";
    const syaratName = `Syarat ${reqNumber}`;
    const syaratQuery = `'${levelFolderId}' in parents and name='${syaratName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const syaratRes = await drive.files.list({ q: syaratQuery, spaces: 'drive', fields: 'files(id, name)' });
    if (syaratRes.data.files && syaratRes.data.files.length > 0) {
      syaratFolderId = syaratRes.data.files[0].id!;
    } else {
      const syaratFolderRes = await drive.files.create({
        requestBody: { name: syaratName, mimeType: 'application/vnd.google-apps.folder', parents: [levelFolderId] },
        fields: 'id'
      });
      syaratFolderId = syaratFolderRes.data.id!;
    }

    let katimFolderId = "";
    const safeKatimName = katimName.replace(/['"]/g, '');
    const katimQuery = `'${syaratFolderId}' in parents and name='${safeKatimName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const katimRes = await drive.files.list({ q: katimQuery, spaces: 'drive', fields: 'files(id, name)' });
    if (katimRes.data.files && katimRes.data.files.length > 0) {
      katimFolderId = katimRes.data.files[0].id!;
    } else {
      const katimFolderRes = await drive.files.create({
        requestBody: { name: safeKatimName, mimeType: 'application/vnd.google-apps.folder', parents: [syaratFolderId] },
        fields: 'id'
      });
      katimFolderId = katimFolderRes.data.id!;
    }

    const fileMetadata = { name: fileName, parents: [katimFolderId] };
    const auth = getAuthClient();
    const token = await auth.getAccessToken();

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': mimeType,
        'X-Upload-Content-Length': fileSize.toString(),
        'Origin': (await headers()).get('origin') || 'https://sikoddlh.vercel.app'
      },
      body: JSON.stringify(fileMetadata)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to create upload session: ${response.statusText} - ${errText}`);
    }

    const uploadUrl = response.headers.get('Location');
    return { success: true, uploadUrl };

  } catch (error: any) {
    console.error("Error getUploadSessionUrl:", error);
    return { success: false, error: error.message };
  }
}

export async function makeFilePublicAndGetLink(fileId: string) {
  try {
    const drive = getDriveService();
    await drive.permissions.create({
      fileId: fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    });
    const fileRes = await drive.files.get({
      fileId: fileId,
      fields: 'webViewLink'
    });
    return { success: true, webViewLink: fileRes.data.webViewLink };
  } catch(e: any) {
    return { success: false, error: e.message };
  }
}
