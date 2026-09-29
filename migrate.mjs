import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';

// Kita ambil config dari .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const requirementsMapping = {
  "1. PERENCANAAN PEMBANGUNAN DAERAH": {
    "Level 1": ["Tanpa dokumen data dukung"],
    "Level 2": ["Dokumen rencana awal Renja PD / Penyesuaian Renja PD terhadap perubahan RKPD"],
    "Level 3": ["Dokumen rencana awal Renja PD / Penyesuaian Renja PD terhadap perubahan RKPD", "Dokumen Renja Perubahan / Renja Final PD"],
    "Level 4": ["Dokumen rencana awal Renja PD / Penyesuaian Renja PD terhadap perubahan RKPD", "Dokumen Renja Perubahan / Renja Final PD", "Dokumen Renstra/Renstra Perubahan PD / telaahan staf"],
    "Level 5": ["Dokumen rencana awal Renja PD / Penyesuaian Renja PD terhadap perubahan RKPD", "Dokumen Renja Perubahan / Renja Final PD", "Dokumen Renstra/Renstra Perubahan PD / telaahan staf", "Dokumen IKU dan pohon kinerja PD yang direviu secara berkala"]
  },
  "2. MONITORING DAN PENGENDALIAN PELAKSANAAN TUGAS": {
    "Level 1": ["Tanpa dokumen data dukung"],
    "Level 2": ["Laporan Monev Kinerja Program/Kegiatan (per triwulan)"],
    "Level 3": ["Laporan Monev Kinerja Program/Kegiatan (per triwulan)", "Tindak Lanjut Hasil Monev Program/Kegiatan"],
    "Level 4": ["Laporan Monev Kinerja Program/Kegiatan (per triwulan)", "Tindak Lanjut Hasil Monev Program/Kegiatan", "Laporan Monev Keuangan (per triwulan)"],
    "Level 5": ["Laporan Monev Kinerja Program/Kegiatan (per triwulan)", "Tindak Lanjut Hasil Monev Program/Kegiatan", "Laporan Monev Keuangan (per triwulan)", "Tindak lanjut Hasil Monev Keuangan"]
  },
  "3. PENJAMINAN MUTU LAYANAN PERANGKAT DAERAH": {
    "Level 1": ["Tanpa dokumen data dukung"],
    "Level 2": ["SK Tim/SK Satgas", "Terdapat dokumentasi rapat"],
    "Level 3": ["SK Tim/SK Satgas", "Terdapat dokumentasi rapat", "Data dukung sesuai indikator 3.2 s.d 3.6 (Surat Edaran, Sosialisasi, Bimbingan Teknis)"],
    "Level 4": ["SK Tim/SK Satgas", "Terdapat dokumentasi rapat", "Data dukung sesuai indikator 3.2 s.d 3.6 (Surat Edaran, Sosialisasi, Bimbingan Teknis)", "Terdapat dokumen evaluasi dan tindak lanjut perbaikan mutu"],
    "Level 5": ["SK Tim/SK Satgas", "Terdapat dokumentasi rapat", "Data dukung sesuai indikator 3.2 s.d 3.6 (Surat Edaran, Sosialisasi, Bimbingan Teknis)", "Terdapat dokumen evaluasi dan tindak lanjut perbaikan mutu", "Terdapat rekomendasi / penghargaan di tingkat provinsi, tingkat nasional, internasional"]
  },
  "4. STANDAR OPERASIONAL PROSEDUR (SOP) PELAYANAN": {
    "Level 1": ["Terdapat SK SOP Makro"],
    "Level 2": ["Terdapat SK SOP Makro", "Terdapat SOP Mikro"],
    "Level 3": ["Terdapat SK SOP Makro", "Terdapat SOP Mikro", "Terdapat perbaikan / reviu SOP Makro & Mikro / Inovasi Layanan"],
    "Level 4": ["Terdapat SK SOP Makro", "Terdapat SOP Mikro", "Terdapat perbaikan / reviu SOP Makro & Mikro / Inovasi Layanan", "Dilakukan monev terhadap pelaksaan SOP Makro & Mikro"],
    "Level 5": ["Terdapat SK SOP Makro", "Terdapat SOP Mikro", "Terdapat perbaikan / reviu SOP Makro & Mikro / Inovasi Layanan", "Dilakukan monev terhadap pelaksaan SOP Makro & Mikro", "Standar Pelayanan dan SOP telah dievaluasi dan ditetapkan kembali"]
  },
  "5. PENDIDIKAN DAN PELATIHAN APARATUR": {
    "Level 1": ["Tanpa dokumen data dukung"],
    "Level 2": ["Usulan kebutuhan diklat sesuai dengan ABK"],
    "Level 3": ["Usulan kebutuhan diklat sesuai dengan ABK", "Dokumen analisis kebutuhan diklat (TNA)"],
    "Level 4": ["Usulan kebutuhan diklat sesuai dengan ABK", "Dokumen analisis kebutuhan diklat (TNA)", "Laporan pasca diklat / Sertifikat (min 20JP/orang/tahun)"],
    "Level 5": ["Usulan kebutuhan diklat sesuai dengan ABK", "Dokumen analisis kebutuhan diklat (TNA)", "Laporan pasca diklat / Sertifikat (min 20JP/orang/tahun)", "Laporan evaluasi pasca diklat terkait peningkatan kinerja pegawai yang mengikuti pelatihan"]
  },
  "6. ANALISIS KEBIJAKAN DAN PEMECAHAN MASALAH": {
    "Level 1": ["Tanpa dokumen data dukung"],
    "Level 2": ["Dokumen telaah staf/nota dinas/hasil rapat teknis internal terkait analisis suatu kebijakan atau pemecahan permasalahan dalam pelaksanaan tugas"],
    "Level 3": ["Dokumen telaah staf/nota dinas/hasil rapat teknis internal terkait analisis suatu kebijakan atau pemecahan permasalahan dalam pelaksanaan tugas", "Dokumen SK Tim (lintas PD)"],
    "Level 4": ["Dokumen telaah staf/nota dinas/hasil rapat teknis internal terkait analisis suatu kebijakan atau pemecahan permasalahan dalam pelaksanaan tugas", "Dokumen SK Tim (lintas PD)", "Dokumen kegiatan tim, hasil dan rekomendasi tim/laporan hasil kajian Tim terhadap suatu permasalahan", "Dokumen Keputusan/Surat Tugas/Kerjasama Tim Ahli (pelibatan Tim Ahli dalam analisis kebijakan/pemecahan masalah sebagai narasumber/kerjasama)"],
    "Level 5": ["Dokumen telaah staf/nota dinas/hasil rapat teknis internal terkait analisis suatu kebijakan atau pemecahan permasalahan dalam pelaksanaan tugas", "Dokumen SK Tim (lintas PD)", "Dokumen kegiatan tim, hasil dan rekomendasi tim/laporan hasil kajian Tim terhadap suatu permasalahan", "Dokumen Keputusan/Surat Tugas/Kerjasama Tim Ahli (pelibatan Tim Ahli dalam analisis kebijakan/pemecahan masalah sebagai narasumber/kerjasama)", "Dokumen kegiatan konsultasi publik (undangan, daftar hadir, notulen)", "Laporan hasil konsultasi publik dan analisis feedback"]
  },
  "7. MANAJEMEN SUMBER DAYA YANG TERUKUR": {
    "Level 1": ["Dokumen peraturan pengelolaan sumber daya (man, money, material) contoh: Peraturan tentang kepegawaian, pengelolaan keuangan, atau pengelolaan barang/aset."],
    "Level 2": ["Dokumen peraturan pengelolaan sumber daya (man, money, material)", "Dokumen rencana kebutuhan pegawai, anggaran, dan barang/aset"],
    "Level 3": ["Dokumen peraturan pengelolaan sumber daya (man, money, material)", "Dokumen rencana kebutuhan pegawai, anggaran, dan barang/aset", "Dokumen analisis standar belanja, analisis jabatan, analisis beban kerja, dan analisis kebutuhan barang"],
    "Level 4": ["Dokumen peraturan pengelolaan sumber daya (man, money, material)", "Dokumen rencana kebutuhan pegawai, anggaran, dan barang/aset", "Dokumen analisis standar belanja, analisis jabatan, analisis beban kerja, dan analisis kebutuhan barang", "Dokumen evaluasi penyediaan sumber daya/SOP/penjaminan mutu (contoh: usulan perubahan kebutuhan pegawai yang dilampiri ABK)"],
    "Level 5": ["Dokumen peraturan pengelolaan sumber daya (man, money, material)", "Dokumen rencana kebutuhan pegawai, anggaran, dan barang/aset", "Dokumen analisis standar belanja, analisis jabatan, analisis beban kerja, dan analisis kebutuhan barang", "Dokumen evaluasi penyediaan sumber daya/SOP/penjaminan mutu (contoh: usulan perubahan kebutuhan pegawai yang dilampiri ABK)", "Dokumen screen shot aplikasi dan manual aplikasipengelolaan sumber daya(man, money, material)"]
  },
  "8. MANAJEMEN RESIKO PELAKSANAAN TUGAS APARATUR": {
    "Level 1": ["Tanpa dokumen data dukung"],
    "Level 2": ["Dokumen identifikasi dan analisis risiko individual (Rencana Tindak Pengendalian unit kerja di bawah PD)"],
    "Level 3": ["Dokumen identifikasi dan analisis risiko individual (Rencana Tindak Pengendalian unit kerja di bawah PD)", "Dokumen SK Satgas SPIP / UPR", "Dokumen kegiatan Satgas (undangan rapat, daftar hadir, dan notulen)", "Register Risiko tugas berisiko tinggi"],
    "Level 4": ["Dokumen identifikasi dan analisis risiko individual (Rencana Tindak Pengendalian unit kerja di bawah PD)", "Dokumen SK Satgas SPIP / UPR", "Dokumen kegiatan Satgas (undangan rapat, daftar hadir, dan notulen)", "Register Risiko tugas berisiko tinggi", "Dokumen Register Resiko seluruh kegiatan (komprehensif) sesuai tujuan sasaran Renstra"],
    "Level 5": ["Dokumen identifikasi dan analisis risiko individual (Rencana Tindak Pengendalian unit kerja di bawah PD)", "Dokumen SK Satgas SPIP / UPR", "Dokumen kegiatan Satgas (undangan rapat, daftar hadir, dan notulen)", "Register Risiko tugas berisiko tinggi", "Dokumen Register Resiko seluruh kegiatan (komprehensif) sesuai tujuan sasaran Renstra", "Dokumen laporan penyelenggaraan SPIP (laporan pengendalian PD/ Realisasi RTP), RTP telah di-update"]
  },
  "9. PENGUKURAN KINERJA PERANGKAT DAERAH": {
    "Level 1": ["Tanpa dokumen data dukung"],
    "Level 2": ["Dokumen Perjanjian Kinerja yang belum konsisten dengan Renja/Renstra", "Dokumen Renja/Renstra"],
    "Level 3": ["Dokumen Perjanjian Kinerja yang konsisten dengan Renja/Renstra", "Dokumen Renja/Renstra"],
    "Level 4": ["Dokumen Perjanjian Kinerja yang konsisten dengan Renja/Renstra", "Dokumen Renja/Renstra", "Dokumen LKJiP", "Dokumen LHE SAKIP"],
    "Level 5": ["Dokumen Perjanjian Kinerja yang konsisten dengan Renja/Renstra", "Dokumen Renja/Renstra", "Dokumen LKJiP", "Dokumen LHE SAKIP dengan capaian kinerja di atas 90%", "Screen shot aplikasi kinerja dan manual aplikasi (e-SAKIP dan e-Kinerja)"]
  },
  "10. PENGEMBANGAN INOVASI PELAYANAN": {
    "Level 1": ["Tanpa dokumen data dukung"],
    "Level 2": ["Dokumen proposal inovasi / Dokumen replikasi inovasi", "Screen shot aplikasi inovasi / dokumentasi pelaksanaan inovasi"],
    "Level 3": ["Dokumen proposal inovasi / Dokumen replikasi inovasi", "Screen shot aplikasi inovasi / dokumentasi pelaksanaan inovasi", "SK pembentukan Tim Inovasi", "Produk hukum penerapan aplikasi"],
    "Level 4": ["Dokumen proposal inovasi / Dokumen replikasi inovasi", "Screen shot aplikasi inovasi / dokumentasi pelaksanaan inovasi", "SK pembentukan Tim Inovasi", "Produk hukum penerapan aplikasi", "Dokumen daftar invensi (temuan) inovasi lokal"],
    "Level 5": ["Dokumen proposal inovasi / Dokumen replikasi inovasi", "Screen shot aplikasi inovasi / dokumentasi pelaksanaan inovasi", "SK pembentukan Tim Inovasi", "Produk hukum penerapan aplikasi", "Dokumen daftar invensi (temuan) inovasi lokal", "Kegiatan dan hasil kerja Tim Inovasi (undangan rapat tim, daftar hadir, notulen, dan laporan kegiatan)", "Dokumen roadmap pengembangan inovasi", "Dokumen perencanaan pengembangan replikasi inovasi"]
  },
  "11. BUDAYA ORGANISASI PERANGKAT DAERAH": {
    "Level 1": ["Tanpa dokumen data dukung"],
    "Level 2": ["Dokumen slogan organisasi tertuang dalam bentuk media cetak/non cetak"],
    "Level 3": ["Dokumen slogan organisasi tertuang dalam bentuk media cetak/non cetak", "Dokumen Penetapan Nilai Budaya Organisasi", "Dokumen SK Kelompok Budaya Kerja (KBK) dan Gugus Kendali Mutu (GKM)", "Dokumen SK Agent of Change"],
    "Level 4": ["Dokumen slogan organisasi tertuang dalam bentuk media cetak/non cetak", "Dokumen Penetapan Nilai Budaya Organisasi", "Dokumen SK Kelompok Budaya Kerja (KBK) dan Gugus Kendali Mutu (GKM)", "Dokumen SK Agent of Change", "Dokumen Sosialisasi nilai budaya kerja (undangan, daftar hadir, foto kegiatan)", "Dokumen Bimtek budaya kerja (undangan, daftar hadir, foto kegiatan)", "Dokumen Lomba gelar budaya kerja (piagam/sertifikat)"],
    "Level 5": ["Dokumen slogan organisasi tertuang dalam bentuk media cetak/non cetak", "Dokumen Penetapan Nilai Budaya Organisasi", "Dokumen SK Kelompok Budaya Kerja (KBK) dan Gugus Kendali Mutu (GKM)", "Dokumen SK Agent of Change", "Dokumen Sosialisasi nilai budaya kerja (undangan, daftar hadir, foto kegiatan)", "Dokumen Bimtek budaya kerja (undangan, daftar hadir, foto kegiatan)", "Dokumen Lomba gelar budaya kerja (piagam/sertifikat)", "Dokumen Penilaian kinerja Kelompok Budaya Kerja, Gugus Kendali Mutu, Agent Of Change", "Rekomendasi dan tindak lanjut hasil evaluasi", "Dokumen penilaian budaya kerja"]
  }
};

async function seed() {
  const batch = writeBatch(db);
  
  Object.entries(requirementsMapping).forEach(([name, levels], index) => {
    // ekstrak nomor 
    const orderStr = name.split('.')[0];
    const order = parseInt(orderStr) || (index + 1);
    
    // buat document
    const docRef = doc(collection(db, 'indicators'));
    batch.set(docRef, {
      name,
      order,
      levels, // map dari Level 1 sampai Level 5
      createdAt: new Date().toISOString()
    });
  });
  
  await batch.commit();
  console.log("Migration complete!");
}

seed().then(() => process.exit(0)).catch(console.error);
