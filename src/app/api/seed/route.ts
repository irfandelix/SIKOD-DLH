import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";

const data = [
  {
    "name": "PERENCANAAN PEMBANGUNAN DAERAH",
    "order": 1,
    "levels": {
      "Level 1": [
        "1. Tanpa dokumen data dukung"
      ],
      "Level 2": [
        "1. Dokumen rencana awal Renja",
        "2. RKA Berbasis Sub Kegiatan"
      ],
      "Level 3": [
        "1. Dokumen rencana awal Renja",
        "2. RKA Berbasis Sub Kegiatan",
        "3. Dokumen Renja berbasis Renstra (Renja kegiatan setahun, kegiatan tersebut ada di Renstra)"
      ],
      "Level 4": [
        "1. Dokumen rencana awal Renja",
        "2. RKA Berbasis Sub Kegiatan",
        "3. Dokumen Renja berbasis Renstra (Renja kegiatan setahun, kegiatan tersebut ada di Renstra)",
        "4. Dokumen cascading kinerja (penjenjangan kinerja, Tabel Bab III, IV, dan V di Renstra)"
      ],
      "Level 5": [
        "1. Dokumen rencana awal Renja",
        "2. RKA Berbasis Sub Kegiatan",
        "3. Dokumen Renja berbasis Renstra (Renja kegiatan setahun, kegiatan tersebut ada di Renstra)",
        "4. Dokumen cascading kinerja (penjenjangan kinerja, Tabel Bab III, IV, dan V di Renstra)",
        "5. Dokumen screen shot aplikasi dan manual aplikasi"
      ]
    },
    "descriptions": {
      "Level 1": "Penentuan kegiatan yang diprioritaskan dalam dokumen perencanaan tahunan (Renja/RKPD) dilakukan tanpa ada kriteria yang terukur.",
      "Level 2": "Penentuan kegiatan yang diprioritaskandalam dokumen rencana tahunan dilakukanberdasarkan analisis terhadap hasil(outcome) apa yang akan dicapai kegiatantersebut.",
      "Level 3": "Penentuan prioritas kegiatan dalam dokumenrencana tahunan dilakukan berdasarkananalisis hasil (outcome) dan analisiskemampuan kegiatan menghasilkan hasil(outcome).",
      "Level 4": "Penentuan prioritas kegiatan dilakukanberdasarkan analisis yang membandingkanhasil (outcome) yang akan dicapai antara satualternatif kegiatan dengan alternatif kegiatanlain.",
      "Level 5": "Penentuan prioritas kegiatan dalam dokumentahunan dilakukan dengan perbandingan hasil(outcome) antara satu alternatif kegiatandengan alternatif kegiatan yang lain dandibantu dengan teknologi informasi."
    }
  },
  {
    "name": "MONITORING DAN PENGENDALIAN PELAKSANAAN TUGAS PERANGKATDAERAH",
    "order": 2,
    "levels": {
      "Level 1": [
        "1. Dokumen undangan, daftar hadir, dan notulensi rapat monitoring kegiatan Perangkat Daerah"
      ],
      "Level 2": [
        "1. Dokumen undangan, daftar hadir, dan notulensi rapat monitoringkegiatan Perangkat Daerah",
        "2. Dokumen regulasi monitoring (terdapat waktu dan muatan monitoring)",
        "3. Hasil monitoring (print-out realisasi fisik, keuangan dan kinerja)"
      ],
      "Level 3": [
        "1. Dokumen undangan, daftar hadir, dan notulensi rapat monitoring kegiatan Perangkat Daerah",
        "2. Dokumen regulasi monitoring (terdapat waktu dan muatan monitoring)",
        "3. Hasil monitoring (print-out realisasi fisik, keuangan dan kinerja)",
        "4. Dokumen capaian realisasi fisik kegiatan =-5% dan dilengkapi dokumen tindaklanjut"
      ],
      "Level 4": [
        "1. Dokumen undangan, daftar hadir, dan notulensi rapat monitoring kegiatan Perangkat Daerah",
        "2. Dokumen regulasi monitoring (terdapat waktu dan muatan monitoring)",
        "3. Hasil monitoring (print-out realisasi fisik, keuangan dan kinerja)",
        "4. Dokumen capaian realisasi fisik kegiatan =-5% dan dilengkapi dokumen tindaklanjut",
        "5. Dokumen hasil tindak lanjut monitoring (laporan kepada Pimpinan berupa telaah/laporan hasil kegiatan maupun kegiatan yang tidak bisa dilaksanakan)"
      ],
      "Level 5": [
        "1. Dokumen undangan, daftar hadir, dan notulensi rapat monitoring kegiatan Perangkat Daerah",
        "2. Dokumen regulasi monitoring (terdapat waktu dan muatan monitoring)",
        "3. Hasil monitoring (print-out realisasi fisik, keuangan dan kinerja)",
        "4. Dokumen capaian realisasi fisik kegiatan =-5% dan dilengkapi dokumen tindaklanjut",
        "5. Dokumen hasil tindak lanjut monitoring (laporan kepada Pimpinan berupa telaah/laporan hasil kegiatan maupun kegiatan yang tidak bisa dilaksanakan)",
        "6. Dokumen screen shot aplikasi dan manual aplikasi"
      ]
    },
    "descriptions": {
      "Level 1": "Monitoring dan pengendalian dilakukandengan cara sederhana dan tidak terstruktur.",
      "Level 2": "Monitoring dan pengendalian dilakukansecara berkala dengan fokus yang ditentukan.",
      "Level 3": "Monitoring dan pengendalian dilakukansecara berkala dengan kriteria penyimpanganyang terstandardisasi pada setiap tahapkegiatan.",
      "Level 4": "Monitoring dan pengendalian dilakukansecara berkala dengan kriteria penyimpanganyang terstandarddisasi dan diikuti denganumpan balik berupa perbaikan yangterdokumentasi dengan baik.",
      "Level 5": "Monitoring dan pengendalian dilakukansecara sistematis, terstandardisasi termasukumpan balik yang didukung oleh penggunaanteknologi informasi berbasis internet."
    }
  },
  {
    "name": "PENJAMINAN MUTU LAYANAN PERANGKAT DAERAH",
    "order": 3,
    "levels": {
      "Level 1": [
        "1. Tanpa dokumen data dukung"
      ],
      "Level 2": [
        "1. Dokumen paraf pelaksanaan kegiatan/telaah staf",
        "2. Undangan, daftar hadir dan notulen rapat teknis internal evaluasi kegiatan"
      ],
      "Level 3": [
        "1. Dokumen paraf pelaksanaan kegiatan/telaah staf",
        "2. Undangan, daftar hadir dan notulen rapat teknis internal evaluasi kegiatan",
        "3. Dokumen SPP/SOP/ hasil evaluasi kegiatan/Dokumen second opinion ahli"
      ],
      "Level 4": [
        "1. Dokumen paraf pelaksanaan kegiatan/telaah staf",
        "2. Undangan, daftar hadir dan notulen rapat teknis internal evaluasi kegiatan",
        "3. Dokumen SPP/SOP/ hasil evaluasi kegiatan/Dokumen second opinion ahli",
        "4. Dokumen sistem penjaminan mutu (ISO/ SMM/ Akreditasi, dan lain-lain)"
      ],
      "Level 5": [
        "1. Dokumen paraf pelaksanaan kegiatan/telaah staf",
        "2. Undangan, daftar hadir dan notulen rapat teknis internal evaluasi",
        "3. Dokumen SPP/SOP/ hasil evaluasi kegiatan/Dokumen second op",
        "4. Dokumen sistem penjaminan mutu (ISO/ SMM/ Akreditasi, dan la",
        "5. Dokumen screen shot aplikasi, manual aplikasi"
      ]
    },
    "descriptions": {
      "Level 1": "Tidak ada penjaminan mutu atas produk yangdihasilkan dan atas proses kerja yangdilakukan.",
      "Level 2": "Penjaminan mutu produk dan proses kerjadilakukan secara berkala namun tidakmempunyai standardd mutu produk danproses yang ditetapkan.",
      "Level 3": "Mutu produk dan proses sudahdistandarddisasi dan dilakukan pengujiansecara berkala secara internal.",
      "Level 4": "Penjaminan mutu produk dan proses distandarddisasi serta dilapengukuran/pengujian secara berkatenaga yang bersertifikat.",
      "Level 5": "Penjaminan mutu produk dan prosesdilakukan terstandarddisasi dan berkala olehtenaga ahli bersertifikat serta didukung olehteknologi informasi berbasis internet."
    }
  },
  {
    "name": "STANDARD OPERASIONAl PROSEDUR (SOP)PELAYANAN PERANGKAT DAERAH",
    "order": 4,
    "levels": {
      "Level 1": [
        "1. Tanpa dokumen data dukung"
      ],
      "Level 2": [
        "1. Dokumen daftar SOP yang sudah ditetapk",
        "2. Daftar SOP yang seharusnya ada"
      ],
      "Level 3": [
        "1. Dokumen daftar SOP yang sudah ditetapkan",
        "2. Daftar SOP yang seharusnya ada",
        "3. Kegiatan evaluasi SOP (Undangan, daftar hadir, dan notulen rapat evaluasi SOP)",
        "4. Laporan hasil evaluasi (nota dinas atau buku laporan)"
      ],
      "Level 4": [
        "1. Dokumen daftar SOP yang sudah ditetapkan",
        "2. Daftar SOP yang seharusnya ada",
        "3. Kegiatan evaluasi SOP (Undangan, daftar hadir, dan notulen rapat evaluasi SOP)",
        "4. Laporan hasil evaluasi (nota dinas atau buku laporan)",
        "5. Dokumen SOP yang direvisi",
        "6. Rekap SOP yang direvisi (kesesuaian hasil evaluasi dengan SOPyang direvisi)"
      ],
      "Level 5": [
        "1. Dokumen daftar SOP yang sudah ditetapkan",
        "2. Daftar SOP yang seharusnya ada",
        "3. Kegiatan evaluasi SOP (Undangan, daftar hadir, dan notulen rapat evaluasi SOP)",
        "4. Laporan hasil evaluasi (nota dinas atau buku laporan)",
        "5. Dokumen SOP yang direvisi",
        "6. Rekap SOP yang direvisi (kesesuaian hasil evaluasi dengan SOPyang direvisi)",
        "7. Penyampaian informasi SOP",
        "8. Dokumen Input/masukan dari masyarakat atas SOP (SOP Online)",
        "9. Screen shot aplikasi SOP dan manual aplikasi SOP"
      ]
    },
    "descriptions": {
      "Level 1": "Tidak ada definisi resmi proses pelaksanaapekerjaan pada Perangkat Daerah.",
      "Level 2": "Definisi proses organisasi sudah dituangkandalam Standardd Operasional Prosedur(SOP).",
      "Level 3": "Definisi proses organisasi sudah dituangkanke dalam SOP dan telah dilakukan evaluasiberkala terhadap penerapan SOP.",
      "Level 4": "Definisi proses organisasi sudah dituangkandalam SOP, sudah dievaluasi secara berkaladan dilakukan tindak lanjut terhadap hasilevaluasi penerapan SOP berupa tindakankoreksi atau perbaikan SOP.",
      "Level 5": "Definisi proses organisasi sudah dituangkandalam SOP dan sudah dilakukan evaluasiserta tindak lanjut, kemudian disesuaikandengan kebutuhan/keluhan pelanggan sertadidukung oleh teknologi berbasis internet."
    }
  },
  {
    "name": "PENDIDIKAN DAN PELATIHAN APARATUR",
    "order": 5,
    "levels": {
      "Level 1": [
        "1. Tanpa dokumen data dukung"
      ],
      "Level 2": [
        "1. Dokumen rencana kebutuhan diklat untuk 1 (satu) atau beberapa pegawai (daftar nama, rencana alokasi anggaran)",
        "2. Surat tugas diklat"
      ],
      "Level 3": [
        "1. Surat tugas diklat",
        "2. Dokumen rencana kebutuhan diklat untuk semua jabatan/pegawai (daftar nama, rencana alokasi anggaran)"
      ],
      "Level 4": [
        "1. Surat tugas diklat",
        "2. Dokumen rencana kebutuhan diklat untuk semua jabatan/pegawai (daftar nama, rencana alokasi anggaran)",
        "3. Dokumen monitoring dan evaluasi diklat (tingkat capaian diklat)"
      ],
      "Level 5": [
        "1. Surat tugas diklat",
        "2. Dokumen rencana kebutuhan diklat untuk semua jabatan/pegawai (daftar nama, rencana alokasi anggaran)",
        "3. Dokumen monitoring dan evaluasi diklat (tingkat capaian diklat)",
        "4. Dokumen revisi rencana pengembangan diklat secara periodik (sesuai analisis kebutuhan diklat)"
      ]
    },
    "descriptions": {
      "Level 1": "Belum ada dokumen resmi rencanakebutuhan pendidikan dan pelatihan padaPerangkat Daerah yang bersangkutan.",
      "Level 2": "Dokumen rencana kebutuhan pengembanganpegawai sudah tersusun secara parsial untukjabatan tertentu.",
      "Level 3": "Dokumen rencana kebutuhan pengembanganpegawai disusun untuk seluruh jabatan.",
      "Level 4": "Rencana pengembangan pegawai dievaluasisecara reguler dan seluruh pengembanganpegawai sudah dilaksanakan sesuai dengandokumen rencana pengembangan pegawaiyang sudah ditetapkan.",
      "Level 5": "Hasil (outcome) pengembangan pegawaidievalusi secara reguler sebagai umpan balik."
    }
  },
  {
    "name": "ANALISIS KEBIJAKAN DAN PEMECAHAN MASALAH TUGAS PERANGKAT DAERAH",
    "order": 6,
    "levels": {
      "Level 1": [
        "1. Dokumen telaah staf/nota dinas/hasil rapat teknis internal terkait analisis suatu kebijakan atau pemecahanpermasalahan dalam pelaksanaan tugas"
      ],
      "Level 2": [
        "1. Dokumen telaah staf/nota dinas/hasil rapat teknis internal terkait analisis suatu kebijakan atau pemecahanpermasalahan dalam pelaksanaan tugas",
        "2. Dokumen SK Tim (internal PD)",
        "3. Dokumen kegiatan tim, hasil dan rekomendasi tim/laporan hasil kajian Tim terhadap suatu permasalahan"
      ],
      "Level 3": [
        "1. Dokumen telaah staf/nota dinas/hasil rapat teknis internal terkait analisis suatu kebijakan atau pemecahanpermasalahan dalam pelaksanaan tugas",
        "2. Dokumen SK Tim (lintas PD)",
        "3. Dokumen kegiatan tim, hasil dan rekomendasi tim/laporan hasil kajian Tim terhadap suatu permasalahan",
        "4. Dokumen Keputusan/Surat Tugas/Kerjasama Tim Ahli (pelibatan Tim Ahli dalam analisis kebijakan/pemecahan masalah sebagai narasumber/kerjasama)"
      ],
      "Level 4": [
        "1. Dokumen telaah staf/nota dinas/hasil rapat teknis internal terkait analisis suatu kebijakan ataupermasalahan dalam pelaksanaan tugas",
        "2. Dokumen SK Tim (lintas PD)",
        "3. Dokumen kegiatan tim, hasil dan rekomendasi tim/laporan hasil kajian Tim terhadap suatu pe",
        "4. Dokumen Keputusan/Surat Tugas/Kerjasama Tim Ahli (pelibatan Tim Ahli dalam analisis kebijmasalah sebagai narasumber/kerjasama)",
        "5. Dokumen kegiatan konsultasi publik (undangan, daftar hadir, notulen)"
      ],
      "Level 5": [
        "1. Dokumen telaah staf/nota dinas/hasil rapat teknis internal terkait analisis suatu kebijakan atau pemecahanpermasalahan dalam pelaksanaan tugas",
        "2. Dokumen SK Tim (lintas PD)",
        "3. Dokumen kegiatan tim, hasil dan rekomendasi tim/laporan hasil kajian Tim terhadap suatu permasalahan",
        "4. Dokumen Keputusan/Surat Tugas/Kerjasama Tim Ahli (pelibatan Tim Ahli dalam analisis kebijakan/pemecahan masalah sebagai narasumber/kerjasama)",
        "5. Dokumen kegiatan konsultasi publik (undangan, daftar hadir, notulen)",
        "6. Laporan hasil konsultasi publik dan analisis feedback"
      ]
    },
    "descriptions": {
      "Level 1": "Analisis kebijakan dan pemecahan masalahdilakukan secara sederhana dan denganmetode yang tidak terukur.",
      "Level 2": "Analisis kebijakan yang berdampak ke publikdilakukan oleh tim internal Perangkat Daerahyang bersangkutan.",
      "Level 3": "Analisis kebijakan dan pemecahan masalahyang berdampak ke publik dilakukanmenggunakan metode/teknik ilmiah oleh timinternal dengan melibatkan instansipemerintah terkait.",
      "Level 4": "Analisis kebijakan dan pemecahan masalahyang bersifat strategis/berdampak ke publikmelibatkan tim ahli.",
      "Level 5": "Analisis kebijakan dan pemecahan masalahstrategis/berdampak ke publik melibatkan timahli dengan melakukan konsultasi publik dananalisis umpan balik yang terukur danterdokumentasi."
    }
  },
  {
    "name": "MANAJEMEN SUMBER DAYA PERALATAN DAN PERLENGKAPAN KERJA YANG TERUKUR",
    "order": 7,
    "levels": {
      "Level 1": [
        "1. Dokumen peraturan pengelolaan sumber daya (man, money, material) contoh: Peraturan tentang kepegawaian,pengelolaan keuangan, atau pengelolaan barang/aset."
      ],
      "Level 2": [
        "1. Dokumen peraturan pengelolaan sumber daya (man, money, material)",
        "2. Dokumen rencana kebutuhan pegawai, anggaran, dan barang/aset"
      ],
      "Level 3": [
        "1. Dokumen peraturan pengelolaan sumber daya (man, money, material)",
        "2. Dokumen rencana kebutuhan pegawai, anggaran, dan barang/aset",
        "3. Dokumen analisis standar belanja, analisis jabatan, analisis beban kerja, dan analisis kebutuhan barang"
      ],
      "Level 4": [
        "1. Dokumen peraturan pengelolaan sumber daya (man, money, material)",
        "2. Dokumen rencana kebutuhan pegawai, anggaran, dan barang/aset",
        "3. Dokumen analisis standar belanja, analisis jabatan, analisis beban kerja, dan analisis kebutuhan barang",
        "4. Dokumen evaluasi penyediaan sumber daya/SOP/penjaminan mutu (contoh: usulan perubahan kebutuhan pegawai yang dilampiri ABK)"
      ],
      "Level 5": [
        "1. Dokumen peraturan pengelolaan sumber daya (man, money, material)",
        "2. Dokumen rencana kebutuhan pegawai, anggaran, dan barang/aset",
        "3. Dokumen analisis standar belanja, analisis jabatan dan analisis beban kerja, dan analisis kebutuhan barang",
        "4. Dokumen evaluasi penyediaan sumber daya/SOP/penjaminan mutu",
        "5. Dokumen screen shot aplikasi dan manual aplikasipengelolaan sumber daya(man, money, material)"
      ]
    },
    "descriptions": {
      "Level 1": "Penggunaan sumber daya dilakukan hanyaberdasarkan ketentuan formal yang berlaku.",
      "Level 2": "Penentuan penggunaan input proyekdilakukan berdasarkan analisis kebutuhanbahan/ sumber daya yang sudah ditetapkan.",
      "Level 3": "Analisis kebutuhan input/sumber daya proyeksudah distandarddisasi dengan proses ujicoba secara terbuka dan menggunakanmetode ilmiah.",
      "Level 4": "Penyediaan sumber daya dalam pelaksanaanproyek dimonitor secara ketat berdasarkanstandard input sumber daya, SOP, danprosedur penjaminan mutu produk.",
      "Level 5": "Penyediaan sumber daya dan pelaksanaanproyek dimonitor secara ketat berdasarkanSOP dan prosedur penjaminan mutu produkdan didukung oleh teknologi informasiberbasis internet."
    }
  },
  {
    "name": "MANAJEMEN RISIKO PELAKSANAAN TUGAS APARATUR",
    "order": 8,
    "levels": {
      "Level 1": [
        "1. Tanpa dokumen data dukung"
      ],
      "Level 2": [
        "1. Dokumen identifikasi dan analisis risiko individual (Rencana Tindak Pengendalian unit kerja di bawah PD)"
      ],
      "Level 3": [
        "1. Dokumen identifikasi dan analisis risiko individual (Rencana Tindak Pengendalian unit kerja di bawah PD)",
        "2. Dokumen SK Satgas SPIP / UPR",
        "3. Dokumen kegiatan Satgas",
        "4. Register Risiko tugas berisiko tinggi"
      ],
      "Level 4": [
        "1. Dokumen identifikasi dan analisis risiko individual (Rencana Tindak Pengendalian unit kerja di bawah PD)",
        "2. Dokumen SK Satgas SPIP / UPR",
        "3. Dokumen kegiatan Satgas (undangan rapat, daftar hadir, dan notulen)",
        "4. Register Risiko tugas berisiko tinggi",
        "5. Dokumen Register Resiko seluruh kegiatan (komprehensif) sesuai tujuan sasaran Renstra"
      ],
      "Level 5": [
        "1. Dokumen identifikasi dan analisis risiko individual (Rencana Tindak Pengendalian unit kerja di bawah PD)",
        "2. Dokumen SK Satgas SPIP / UPR",
        "3. Dokumen kegiatan Satgas (undangan rapat, daftar hadir, dan notulen)",
        "4. Register Risiko tugas berisiko tinggi",
        "5. Dokumen Register Resiko seluruh kegiatan (komprehensif) sesuai tujuan sasaran Renstra",
        "6. Dokumen laporan penyelenggaraan SPIP (laporan pengendalian PD/ Realisasi RTP), RTP telah di-update"
      ]
    },
    "descriptions": {
      "Level 1": "Belum ada manajemen risiko dalampelaksanaan tugas pada Perangkat Daerah.",
      "Level 2": "Sudah ada sebagian pegawai yangmelakukan analisis risiko dalam pelaksanaantugasnya, namun hanya bersifat individu.",
      "Level 3": "Perangkat Daerah sudah menetapkanprosedur pengelolaan risiko dalampelaksanaan tugas tertentu yang dipandangmempunyai risiko tinggi.",
      "Level 4": "Perangkat Daerah sudah menetapkanprosedur pengelolaan risiko untuk seluruhtugas pada Perangkat Daerah yangbersangkutan, namun belum dilakukanevaluasi secara berkala.",
      "Level 5": "Perangkat Daerah sudah menetapkanprosedur pengelolaan risiko dalampelaksanaan tugas serta semua risiko dapatdikendalikan tanpa ada kerugian baik bagipegawai maupun instansi."
    }
  },
  {
    "name": "PENGUKURAN KINERJA PERANGKAT DAERAH DAN APARATUR",
    "order": 9,
    "levels": {
      "Level 1": [
        "1. Tanpa dokumen data dukung"
      ],
      "Level 2": [
        "1. Dokumen Perjanjian Kinerja yang belum konsisten dengan Renstra",
        "2. Dokumen Renstra"
      ],
      "Level 3": [
        "1. Dokumen Perjanjian Kinerja yang konsisten dengan Renstra",
        "2. Dokumen Renstra"
      ],
      "Level 4": [
        "1. Dokumen Perjanjian Kinerja yang konsisten dengan Renstra",
        "2. Dokumen Renstra",
        "3. Dokumen LKJiP",
        "4. Dokumen LHE SAKIP"
      ],
      "Level 5": [
        "1. Dokumen Perjanjian Kinerja yang konsisten dengan Renstra",
        "2. Dokumen Renstra",
        "3. Dokumen LKJiP",
        "4. Dokumen LHE SAKIPdengan capaian kinerja di atas 90%",
        "5. Screen shot aplikasi kinerja dan manual aplikasi (e-SAKIP dan e-Kinerja)"
      ]
    },
    "descriptions": {
      "Level 1": "Belum ada target/rencana kinerja PerangkatDaerah yang terukur.",
      "Level 2": "Sudah ada target kinerja Perangkat Daerah,tapi belum konsisten mengacu dokumenperencanaan daerah.",
      "Level 3": "Sudah ada target kinerja Perangkat Daerahyang konsisten dengan dokumenperencanaan.",
      "Level 4": "Target kinerja Perangkat Daerah sudahdilakukan pengukuran pencapaiannya.",
      "Level 5": "Pencapaian target kinerja Perangkat Daerahsudah diukur dan sudah tercapai dengan baik(di atas 90%) serta telah dilakukan evaluasipencapaian target kinerja serta didukungdengan teknologi informasi."
    }
  },
  {
    "name": "PENGEMBANGAN INOVASI LAYANAN PERANGKAT DAERAH",
    "order": 10,
    "levels": {
      "Level 1": [
        "1. Tanpa dokumen data dukung"
      ],
      "Level 2": [
        "1. Dokumen proposal inovasi/Dokumen replikasi inovasi",
        "2. Screen shot aplikasi inovasi"
      ],
      "Level 3": [
        "1. Dokumen proposal inovasi/Dokumen replikasi inovasi",
        "2. Screen shot aplikasi inovasi/dokumentasi pelaksanaan inovasi",
        "3. SK pembentukan Tim Inovasi",
        "4. Produk hukum penerapan aplikasi"
      ],
      "Level 4": [
        "1. Dokumen proposal inovasi/Dokumen replikasi inovasi",
        "2. Screen shot aplikasi inovasi/dokumentasi pelaksanaan inovasi",
        "3. SK pembentukan Tim Inovasi",
        "4. Produk hukum penerapan aplikasi",
        "5. Dokumen daftar invensi (temuan) inovasi lokal"
      ],
      "Level 5": [
        "1. Dokumen proposal inovasi/Dokumen replikasi inovasi",
        "2. Screen shot aplikasi inovasi/dokumentasi pelaksanaan inovasi",
        "3. SK pembentukan Tim Inovasi",
        "4. Produk hukum penerapan aplikasi",
        "5. Dokumen daftar invensi (temuan) inovasi lokal",
        "6. Kegiatan dan hasil kerja Tim Inovasi (undangan rapat tim, daftar hadir, notulen, dan laporan kegiatan)",
        "7. Dokumen roadmap pengembangan inovasi",
        "8. Dokumen perencanaan pengembangan replikasi inovasi"
      ]
    },
    "descriptions": {
      "Level 1": "Belum ada rencana pengembangan produkyang akan dilakukan secara sistematis.",
      "Level 2": "Pengembangan produk dilakukan denganmengadopsi inovasi yang dikembangkan olehdaerah lain (replikasi inovasi).",
      "Level 3": "Telah disusun rencana pengembanganinovasi baik jenis, mutu maupun metodenya.",
      "Level 4": "Telah ada inovasi yang dikembangkan sendirioleh Perangkat Daerah yang bersangkutan.",
      "Level 5": "Perangkat Daerah sudah mempunyaprogram pengkajian dan inovasi secaraterencana dan berkelanjutan."
    }
  },
  {
    "name": "BUDAYA ORGANISASI PERANGKAT DAERAH",
    "order": 11,
    "levels": {
      "Level 1": [
        "1. Tanpa dokumen data dukung"
      ],
      "Level 2": [
        "1. Dokumen slogan organisasi tertuang dalam bentuk media cetak/non cetak"
      ],
      "Level 3": [
        "1. Dokumen slogan organisasi tertuang dalam bentuk media cetak/non cetak",
        "2. Dokumen Penetapan Nilai Budaya Organisasi",
        "3. Dokumen SK Kelompok Budaya Kerja (KBK) dan Gugus Kendali Mutu (GKM)",
        "4. Dokumen SK Agent of Change"
      ],
      "Level 4": [
        "1. Dokumen slogan organisasi tertuang dalam bentuk media cetak/non cetak",
        "2. Dokumen Penetapan Nilai Budaya Organisasi",
        "3. Dokumen SK Kelompok Budaya Kerja (KBK) dan Gugus Kendali Mutu (GKM)",
        "4. Dokumen SK Agent of Change",
        "5. Dokumen Sosialisasi nilai budaya kerja (undangan, daftar hadir, foto kegiatan)",
        "6. Dokumen Bimtek budaya kerja (undangan, daftar hadir, foto kegiatan)",
        "7. Dokumen Lomba gelar budaya kerja (piagam/sertifikat)"
      ],
      "Level 5": [
        "1. Dokumen slogan organisasi tertuang dalam bentuk media cetak/non cetak",
        "2. Dokumen Penetapan Nilai Budaya Organisasi",
        "3. Dokumen SK Kelompok Budaya Kerja (KBK) dan Gugus Kendali Mutu (GKM)",
        "4. Dokumen SK Agent of Change",
        "5. Dokumen Sosialisasi nilai budaya kerja (undangan, daftar hadir, foto kegiatan)",
        "6. Dokumen Bimtek budaya kerja (undangan, daftar hadir, foto kegiatan)",
        "7. Dokumen Lomba gelar budaya kerja (piagam/sertifikat)",
        "8. Dokumen Penilaian kinerja Kelompok Budaya Kerja, Gugus Kendali Mutu, Agent Of Change",
        "9. Rekomendasi dan tindak lanjut hasil evaluasi",
        "10. Dokumen penilaian budaya kerja"
      ]
    },
    "descriptions": {
      "Level 1": "Belum ada budaya organisasi padaPerangkat Daerah.",
      "Level 2": "Sudah ada slogan-slogan yangmenggambarkan nilai organisasi padaPerangkat Daerah yang bersangkutan.",
      "Level 3": "Sudah ada dokumen budaya organisasi yangresmi menggambarkan nilai-nilai, sikap danperilaku di Perangkat Daerah yangbersangkutan.",
      "Level 4": "Sudah ada program internalisasi budayaorganisasi yang berkelanjutan berdasarkandokumen resmi.",
      "Level 5": "Budaya organisasi sudah tercermin dalamsikap dan perilaku pegawai pada PerangkatDaerah yang bersangkutan berdasarkan hasilevaluasi secara rutin dan berkelanjutan."
    }
  }
];

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "indicators"));
    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "indicators", d.id)));
    await Promise.all(deletePromises);

    const insertPromises = data.map((item: any) => addDoc(collection(db, "indicators"), item));
    await Promise.all(insertPromises);

    return NextResponse.json({ success: true, count: data.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
